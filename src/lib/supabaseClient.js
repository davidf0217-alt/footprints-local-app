import { createClient } from "@supabase/supabase-js";

// 仅使用可公开的 publishable key；service_role、数据库密码和 SMTP 凭据绝不能出现在客户端。
const projectUrl = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const cloudConfigured = Boolean(projectUrl && publishableKey);
export const supabase = cloudConfigured ? createClient(projectUrl, publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null;
