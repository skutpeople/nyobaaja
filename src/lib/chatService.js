// src/lib/chatService.js
import { supabase } from './supabaseClient'

/**
 * Ambil semua pesan untuk kategori tertentu (di ChatPage ini: food_analysis)
 */
export async function getChatHistory(messageType) {
  const { data, error } = await supabase
    .from('chat_history')
    .select('id, message, sender, created_at')
    .eq('user_id', supabase.auth.user().id)
    .eq('message_type', messageType)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Tambah satu pesan (user atau bot) ke chat_history
 */
export async function addChatMessage({ message, sender, messageType }) {
  const { error } = await supabase
    .from('chat_history')
    .insert({
      user_id:      supabase.auth.user().id,
      message,
      sender,            // 'user' atau 'bot'
      message_type:     messageType,
    })

  if (error) throw error
}