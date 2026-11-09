import { GoogleGenAI, Type } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';
import { db } from '../db/index.ts';
import { products, sales, expenses, customers, stockMovements, businesses } from '../db/schema.ts';
import { eq, and, lte, desc, sql } from 'drizzle-orm';
import { calculateFinancialSummary } from '../utils/businessMath.ts';

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Tool declarations for BiasharaOS Database Queries
const getFinancialSummaryTool: FunctionDeclaration = {
  name: 'getFinancialSummary',
  description: 'Calculates the real revenue, cost of goods sold, gross profit, total expenses, and net profit for this business from PostgreSQL records.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      timeframe: {
        type: Type.STRING,
        description: 'Timeframe description, e.g. "this_month", "all_time", "last_month"',
      },
    },
  },
};

const getTopSellingProductsTool: FunctionDeclaration = {
  name: 'getTopSellingProducts',
  description: 'Returns products ranked by sales revenue and stock status for this business.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      limit: {
        type: Type.INTEGER,
        description: 'Maximum number of products to return (default 5)',
      },
    },
  },
};

const getCustomersWithBalancesTool: FunctionDeclaration = {
  name: 'getCustomersWithBalances',
  description: 'Retrieves all customers who have outstanding credit or unpaid debt balances with their contact information.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getLargestExpensesTool: FunctionDeclaration = {
  name: 'getLargestExpenses',
  description: 'Fetches the largest recorded expense items, categories, and payment methods for this business.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      limit: {
        type: Type.INTEGER,
        description: 'Maximum number of expense records to retrieve (default 5)',
      },
    },
  },
};

const getRestockingAlertsTool: FunctionDeclaration = {
  name: 'getRestockingAlerts',
  description: 'Finds products that are low in stock (at or below minimum stock alert threshold) needing urgent supplier reorders.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

export async function askBusinessAssistant(businessId: number, userPrompt: string): Promise<{
  text: string;
  toolCallsExecuted: string[];
  groundedData?: any;
}> {
  const toolCallsExecuted: string[] = [];

  // Function executors against Cloud SQL PostgreSQL with strict tenant isolation (businessId)
  async function executeTool(name: string, args: any): Promise<any> {
    toolCallsExecuted.push(name);
    if (name === 'getFinancialSummary') {
      const salesRows = await db.select().from(sales).where(eq(sales.businessId, businessId));
      const expenseRows = await db.select().from(expenses).where(eq(expenses.businessId, businessId));
      const productRows = await db.select().from(products).where(eq(products.businessId, businessId));

      const totalRevenue = salesRows.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalExpenses = expenseRows.reduce((sum, e) => sum + e.amount, 0);

      // Estimate COGS from product costs in sales items
      let totalCogs = 0;
      for (const sale of salesRows) {
        try {
          const items = JSON.parse(sale.itemsJson || '[]');
          for (const item of items) {
            const prod = productRows.find((p) => p.id === item.productId);
            if (prod) {
              totalCogs += prod.costPrice * (item.quantity || 1);
            }
          }
        } catch {
          // ignore parsing error
        }
      }

      const summary = calculateFinancialSummary({
        salesTotal: totalRevenue,
        costOfGoodsSold: totalCogs,
        expensesTotal: totalExpenses,
      });

      return {
        ...summary,
        totalSalesCount: salesRows.length,
        totalExpensesCount: expenseRows.length,
        currency: 'KES',
      };
    }

    if (name === 'getTopSellingProducts') {
      const limit = args?.limit || 5;
      const allProducts = await db.select().from(products).where(eq(products.businessId, businessId));
      const allSales = await db.select().from(sales).where(eq(sales.businessId, businessId));

      const productSalesMap: Record<number, { unitsSold: number; revenue: number }> = {};
      for (const sale of allSales) {
        try {
          const items = JSON.parse(sale.itemsJson || '[]');
          for (const item of items) {
            if (item.productId) {
              if (!productSalesMap[item.productId]) {
                productSalesMap[item.productId] = { unitsSold: 0, revenue: 0 };
              }
              productSalesMap[item.productId].unitsSold += item.quantity || 1;
              productSalesMap[item.productId].revenue += item.total || item.unitPrice * (item.quantity || 1);
            }
          }
        } catch {}
      }

      const ranked = allProducts
        .map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          sellingPrice: p.sellingPrice,
          stockQuantity: p.stockQuantity,
          unitsSold: productSalesMap[p.id]?.unitsSold || 0,
          revenueGenerated: productSalesMap[p.id]?.revenue || 0,
        }))
        .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
        .slice(0, limit);

      return { products: ranked, currency: 'KES' };
    }

    if (name === 'getCustomersWithBalances') {
      const debtCustomers = await db
        .select()
        .from(customers)
        .where(and(eq(customers.businessId, businessId), sql`${customers.outstandingBalance} > 0`))
        .orderBy(desc(customers.outstandingBalance));

      return {
        count: debtCustomers.length,
        totalOutstandingDebt: debtCustomers.reduce((acc, c) => acc + c.outstandingBalance, 0),
        customers: debtCustomers.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          outstandingBalance: c.outstandingBalance,
          notes: c.notes,
        })),
        currency: 'KES',
      };
    }

    if (name === 'getLargestExpenses') {
      const limit = args?.limit || 5;
      const expenseList = await db
        .select()
        .from(expenses)
        .where(eq(expenses.businessId, businessId))
        .orderBy(desc(expenses.amount))
        .limit(limit);

      return {
        expenses: expenseList.map((e) => ({
          category: e.category,
          amount: e.amount,
          description: e.description,
          paidTo: e.paidTo,
          date: e.expenseDate,
          method: e.paymentMethod,
        })),
        currency: 'KES',
      };
    }

    if (name === 'getRestockingAlerts') {
      const lowStockProducts = await db
        .select()
        .from(products)
        .where(and(eq(products.businessId, businessId), sql`${products.stockQuantity} <= ${products.minStockAlert}`))
        .orderBy(products.stockQuantity);

      return {
        count: lowStockProducts.length,
        items: lowStockProducts.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          currentStock: p.stockQuantity,
          minAlert: p.minStockAlert,
          unit: p.unit,
        })),
      };
    }

    return { error: `Unknown tool: ${name}` };
  }

  // If GEMINI_API_KEY is not a valid configured key, provide direct deterministic database query result
  const apiKey = process.env.GEMINI_API_KEY;
  const isRealApiKey = !!(apiKey && !apiKey.startsWith('MY_') && apiKey.length > 20);

  if (!isRealApiKey) {
    const qLower = userPrompt.toLowerCase();
    let dataOutput: any = null;
    let toolName = 'getFinancialSummary';

    if (qLower.includes('product') || qLower.includes('best') || qLower.includes('highest revenue') || qLower.includes('top selling')) {
      toolName = 'getTopSellingProducts';
      dataOutput = await executeTool(toolName, { limit: 5 });
    } else if (qLower.includes('restock') || qLower.includes('low stock') || qLower.includes('stock alert') || qLower.includes('inventory')) {
      toolName = 'getRestockingAlerts';
      dataOutput = await executeTool(toolName, {});
    } else if (qLower.includes('customer') || qLower.includes('debt') || qLower.includes('balance') || qLower.includes('owing') || qLower.includes('unpaid')) {
      toolName = 'getCustomersWithBalances';
      dataOutput = await executeTool(toolName, {});
    } else if (qLower.includes('expense') || qLower.includes('spent') || qLower.includes('cost')) {
      toolName = 'getLargestExpenses';
      dataOutput = await executeTool(toolName, { limit: 5 });
    } else {
      toolName = 'getFinancialSummary';
      dataOutput = await executeTool(toolName, {});
    }

    let summaryText = `Here are the verified records from your PostgreSQL database:\n\n`;
    if (toolName === 'getFinancialSummary') {
      summaryText += `• **Gross Revenue**: KES ${dataOutput.revenue.toLocaleString()}\n` +
        `• **Cost of Goods Sold (COGS)**: KES ${dataOutput.cogs.toLocaleString()}\n` +
        `• **Gross Profit**: KES ${dataOutput.grossProfit.toLocaleString()} (${dataOutput.grossMarginPct}%)\n` +
        `• **Operating Expenses**: KES ${dataOutput.expenses.toLocaleString()}\n` +
        `• **Net Profit**: KES ${dataOutput.netProfit.toLocaleString()} (${dataOutput.netMarginPct}%)\n` +
        `• **Transactions**: ${dataOutput.totalSalesCount} sales recorded.`;
    } else if (toolName === 'getTopSellingProducts') {
      summaryText += `Top Revenue Generating Products:\n` +
        dataOutput.products.map((p: any, idx: number) => `${idx + 1}. **${p.name}** (${p.sku}) — KES ${p.revenueGenerated.toLocaleString()} (${p.unitsSold} units sold, current stock: ${p.stockQuantity})`).join('\n');
    } else if (toolName === 'getCustomersWithBalances') {
      summaryText += `Total Outstanding Customer Balances: **KES ${dataOutput.totalOutstandingDebt.toLocaleString()}** across ${dataOutput.count} customers:\n` +
        dataOutput.customers.map((c: any) => `• **${c.name}** (${c.phone}): KES ${c.outstandingBalance.toLocaleString()}${c.notes ? ` — ${c.notes}` : ''}`).join('\n');
    } else if (toolName === 'getRestockingAlerts') {
      summaryText += `**${dataOutput.count} product(s) requiring restocking**:\n` +
        dataOutput.items.map((i: any) => `⚠️ **${i.name}** (${i.sku}): ${i.currentStock} ${i.unit} in stock (Min Alert: ${i.minAlert} ${i.unit})`).join('\n');
    } else if (toolName === 'getLargestExpenses') {
      summaryText += `Largest Business Expenses:\n` +
        dataOutput.expenses.map((e: any, idx: number) => `${idx + 1}. **${e.description}** [${e.category}] — KES ${e.amount.toLocaleString()} (Paid to: ${e.paidTo || 'N/A'}, via ${e.method})`).join('\n');
    }

    summaryText += `\n\n*(Note: To enable custom conversational styling with Gemini natural language generation, connect your GEMINI_API_KEY in Settings > Secrets.)*`;

    return {
      text: summaryText,
      toolCallsExecuted,
      groundedData: dataOutput,
    };
  }

  // Full Gemini API flow with Function Calling
  try {
    const businessRows = await db.select().from(businesses).where(eq(businesses.id, businessId));
    const businessName = businessRows[0]?.name || 'BiasharaOS Business';

    const systemInstruction = `You are BiasharaOS Assistant, an elite AI business advisory intelligence built for Kenyan SMEs and African growing enterprises.
You are assisting ${businessName}.
STRICT GROUNDING RULES:
1. You MUST query the database using the provided tools to answer financial, sales, inventory, expense, and customer questions.
2. NEVER invent or fabricate numbers, transactions, or stock figures.
3. If data is not found, state clearly that no records exist in the database.
4. Format all monetary values in Kenyan Shillings (KES).
5. Provide actionable, concise executive insights based on the real figures.`;

    const tools = [
      {
        functionDeclarations: [
          getFinancialSummaryTool,
          getTopSellingProductsTool,
          getCustomersWithBalancesTool,
          getLargestExpensesTool,
          getRestockingAlertsTool,
        ],
      },
    ];

    // First round of model generation
    const response1 = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction,
        tools,
      },
    });

    const functionCalls = response1.functionCalls;
    if (functionCalls && functionCalls.length > 0 && functionCalls[0].name) {
      const call = functionCalls[0];
      const callName: string = call.name || '';
      const toolResult = await executeTool(callName, call.args);

      // Follow-up round passing the functionResponse back to Gemini
      const previousContent = response1.candidates?.[0]?.content;
      if (previousContent) {
        const response2 = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            { role: 'user', parts: [{ text: userPrompt }] },
            previousContent,
            {
              role: 'user',
              parts: [
                {
                  functionResponse: {
                    id: call.id,
                    name: callName,
                    response: toolResult,
                  },
                },
              ],
            },
          ],
          config: {
            systemInstruction,
            tools,
          },
        });

        return {
          text: response2.text || 'Analysis completed from database.',
          toolCallsExecuted,
          groundedData: toolResult,
        };
      }
    }

    return {
      text: response1.text || 'I analyzed your request, but found no matching records in your database.',
      toolCallsExecuted,
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    // Fallback to direct DB query if API encounters rate limits or errors
    const dataOutput = await executeTool('getFinancialSummary', {});
    return {
      text: `[Database Grounded Fallback]\n• Revenue: KES ${dataOutput.revenue.toLocaleString()}\n• Net Profit: KES ${dataOutput.netProfit.toLocaleString()}\n• COGS: KES ${dataOutput.cogs.toLocaleString()}\n• Expenses: KES ${dataOutput.expenses.toLocaleString()}`,
      toolCallsExecuted: ['getFinancialSummary (fallback)'],
      groundedData: dataOutput,
    };
  }
}
