import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Инициализируем Supabase (используй SERVICE_ROLE_KEY из .env, чтобы иметь права на запись)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Проверяем, пришла ли информация об успешной оплате
    const payment = body.message?.successful_payment;

    if (payment) {
      // Извлекаем userId, который мы зашивали в payload в методе createInvoiceLink
      // Наш payload выглядит так: "premium_1234567_timestamp"
      const payloadParts = payment.invoice_payload.split('_');
      const userId = payloadParts[1]; 

      // 2. Обновляем статус пользователя в Supabase
      const { error } = await supabase
        .from('users') // Твоя таблица пользователей
        .update({ user_subscription: 'premium' })
        .eq('telegram_id', userId);

      if (error) {
        console.error('Ошибка при обновлении подписки:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      console.log(`Пользователь ${userId} теперь Premium! ✨`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook Error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}