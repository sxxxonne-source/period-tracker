import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN; // Добавь в .env.local

    // Параметры платежа
    const invoiceData = {
      title: "Premium статус",
      description: "Доступ к уведомлениям и расширенному прогнозу ✨",
      payload: `premium_${userId}_${Date.now()}`, // Уникальный ID транзакции
      currency: "XTR", // Код валюты для Telegram Stars
      prices: [
        { label: "Premium", amount: 50 } // Цена в звездах
      ]
    };

    const response = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    });

    const result = await response.json();

    if (result.ok) {
      return NextResponse.json({ invoiceUrl: result.result });
    } else {
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}