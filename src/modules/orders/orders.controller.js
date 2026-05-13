import { supabaseAdmin } from "../../config/supabase.js";
import { HttpError, asyncHandler, created, ok } from "../../utils/response.js";

async function getSetting(key, fallback) {
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return data?.value ?? fallback;
}

export const create = asyncHandler(async (req, res) => {
  const { customer_name, customer_phone, customer_address, notes, items } = req.body;

  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[orders.create] auth=${req.user ? `user ${req.user.id} (${req.user.email})` : "guest"}`
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, "Cart is empty");
  }

  // Validate items against DB (fresh prices)
  const ids = [...new Set(items.map((it) => it.product_id))];
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("id,name,price,category,stock")
    .in("id", ids);
  if (error) throw new HttpError(500, error.message);

  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = [];
  let subtotal = 0;
  for (const it of items) {
    const p = byId.get(it.product_id);
    if (!p) throw new HttpError(404, `Product not found: ${it.product_id}`);
    const qty = Math.max(1, Number(it.qty) || 1);
    const price = Number(p.price);
    const line_total = price * qty;
    subtotal += line_total;
    lines.push({
      product_id: p.id,
      name: p.name,
      category: p.category,
      price,
      qty,
      line_total,
    });
  }

  const delivery_fee = Number(await getSetting("public.delivery_fee", 0)) || 0;
  const total = subtotal + delivery_fee;

  const { data: order, error: insErr } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: req.user?.id ?? null,
      customer_name,
      customer_phone,
      customer_address: customer_address || null,
      notes: notes || null,
      items: lines,
      subtotal,
      delivery_fee,
      total,
    })
    .select()
    .single();
  if (insErr) throw new HttpError(500, insErr.message);

  const whatsapp_number = await getSetting("public.whatsapp_number", "");
  const currency = await getSetting("public.currency", "DT");
  const company = await getSetting("public.company_name", "Shop");

  const messageLines = [
    `*New order — ${company}*`,
    "",
    `*Name:*  ${customer_name}`,
    `*Phone:* ${customer_phone}`,
  ];
  if (customer_address) messageLines.push(`*Address:* ${customer_address}`);
  if (notes) messageLines.push(`*Notes:* ${notes}`);
  messageLines.push("", "*Items:*");
  for (const l of lines) {
    messageLines.push(`• ${l.name} × ${l.qty} = ${l.line_total.toFixed(2)} ${currency}`);
  }
  messageLines.push("", `*Subtotal:* ${subtotal.toFixed(2)} ${currency}`);
  if (delivery_fee) messageLines.push(`*Delivery:* ${delivery_fee.toFixed(2)} ${currency}`);
  messageLines.push(`*Total:* ${total.toFixed(2)} ${currency}`);
  messageLines.push("", `Order ref: ${order.id}`);

  const text = messageLines.join("\n");
  const whatsapp_url = whatsapp_number
    ? `https://wa.me/${String(whatsapp_number).replace(/\D/g, "")}?text=${encodeURIComponent(text)}`
    : null;

  return created(res, { order, whatsapp_url, whatsapp_text: text });
});

export const listMine = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });
  if (error) throw new HttpError(500, error.message);
  return ok(res, { items: data });
});

export const list = asyncHandler(async (req, res) => {
  const { status, limit = 100, offset = 0 } = req.query;
  let q = supabaseAdmin
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);
  if (status) q = q.eq("status", status);
  const { data, error, count } = await q;
  if (error) throw new HttpError(500, error.message);
  return ok(res, { items: data, total: count });
});

export const getOne = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Order not found");
  return ok(res, { order: data });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Order not found");
  return ok(res, { order: data });
});

export const remove = asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin.from("orders").delete().eq("id", req.params.id);
  if (error) throw new HttpError(500, error.message);
  return ok(res, { message: "Order deleted" });
});
