import funcUrls from '../../backend/func2url.json';
import type { Achievement, CharacterNotification, KineticsTransaction, PurchasedItem, Tournament, TournamentEntry, TrainingVisit, PublicProfile, LeaderboardEntry } from '@/types/kinetic';

const API_URL = (funcUrls as Record<string, string>)['kinetic-api'];

const SPORT_AVATARS: Record<string, string> = {
  skate: 'https://cdn.poehali.dev/projects/0c4f37be-1173-4603-b652-9ad25c1071b9/files/f84de1b3-c449-41d4-ae13-02c551d8ff9f.jpg',
  rollers: 'https://cdn.poehali.dev/projects/0c4f37be-1173-4603-b652-9ad25c1071b9/files/84387cf9-6400-4cd1-86f6-07f70e7b14c3.jpg',
  bmx: 'https://cdn.poehali.dev/projects/0c4f37be-1173-4603-b652-9ad25c1071b9/files/d799a9a2-36ea-4c3f-8b8b-4ea2b81789f8.jpg',
  scooter: 'https://cdn.poehali.dev/projects/0c4f37be-1173-4603-b652-9ad25c1071b9/files/f591c071-da0e-4dc8-b60f-1e187ca6aacf.jpg',
  bike: 'https://cdn.poehali.dev/projects/0c4f37be-1173-4603-b652-9ad25c1071b9/files/85a72636-b6aa-46f1-9e7a-809ff8336c0e.jpg',
};

export function getAvatarForSport(sportType: string): string {
  return SPORT_AVATARS[sportType] || SPORT_AVATARS.skate;
}

async function request(method: string, params: Record<string, string> = {}, body?: Record<string, unknown>) {
  const url = new URL(API_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok && res.status !== 404) {
    throw new Error(data.error || 'API Error');
  }
  return { status: res.status, data };
}

export async function getMyCharacter(userId: string) {
  const { status, data } = await request('GET', { action: 'my_character', user_id: userId });
  if (status === 404) return null;
  return data.character;
}

export async function getAllCharacters() {
  const { data } = await request('GET', { action: 'all_characters' });
  return data.characters;
}

export async function createCharacter(body: {
  user_id: string;
  name: string;
  sport_type: string;
  riding_style: string;
  body_type: number;
  hairstyle: number;
  hair_color: string;
  age?: number;
}) {
  const { data } = await request('POST', { action: 'create_character' }, body as unknown as Record<string, unknown>);
  return data.character;
}

export async function updateCharacter(characterId: number, body: Record<string, unknown>) {
  const { data } = await request('PUT', { action: 'update_character', character_id: characterId.toString() }, body);
  return data.character;
}

export async function getTricks() {
  const { data } = await request('GET', { action: 'get_tricks' });
  return data.tricks;
}

export async function getMasteredTricks(characterId: number) {
  const { data } = await request('GET', { action: 'get_mastered_tricks', character_id: characterId.toString() });
  return data.tricks;
}

export async function confirmTrick(characterId: number, trickId: number, trainerName: string) {
  const { data } = await request('POST', { action: 'confirm_trick' }, {
    character_id: characterId,
    trick_id: trickId,
    confirmed_by: trainerName,
  });
  return data.result;
}

export async function getShopItems() {
  const { data } = await request('GET', { action: 'get_shop_items' });
  return data.items;
}

export async function purchaseItem(characterId: number, itemId: number, itemType: string, cost: number) {
  const { data } = await request('POST', { action: 'purchase_item' }, {
    character_id: characterId,
    item_id: itemId,
    item_type: itemType,
    cost,
  });
  return data.result;
}

export async function getInventory(characterId: number) {
  const { data } = await request('GET', { action: 'get_inventory', character_id: characterId.toString() });
  return data.items;
}

export async function addKinetics(characterId: number, amount: number, source: string) {
  const { data } = await request('POST', { action: 'add_kinetics' }, {
    character_id: characterId,
    amount,
    source,
  });
  return data.result;
}

export async function deductKinetics(characterId: number, amount: number, source: string) {
  const { data } = await request('POST', { action: 'deduct_kinetics' }, {
    character_id: characterId,
    amount,
    source,
  });
  return data.result;
}

export async function getKineticsTransactions(characterId: number): Promise<KineticsTransaction[]> {
  const { data } = await request('GET', { action: 'get_kinetics_transactions', character_id: characterId.toString() });
  return data.transactions;
}

export async function getCurrentTournament(): Promise<Tournament | null> {
  const { status, data } = await request('GET', { action: 'get_current_tournament' });
  if (status === 404) return null;
  return data.tournament;
}

export async function joinTournament(characterId: number, tournamentId: number): Promise<TournamentEntry> {
  const { data } = await request('POST', { action: 'join_tournament' }, {
    character_id: characterId,
    tournament_id: tournamentId,
  });
  return data.result;
}

export async function getTournamentLeaderboard(tournamentId: number): Promise<LeaderboardEntry[]> {
  const { data } = await request('GET', { action: 'get_tournament_leaderboard', tournament_id: tournamentId.toString() });
  return data.leaderboard;
}

export async function recordTrainingVisit(characterId: number, trainerName: string, notes?: string): Promise<TrainingVisit> {
  const { data } = await request('POST', { action: 'record_training_visit' }, {
    character_id: characterId,
    trainer_name: trainerName,
    notes: notes || '',
  });
  return data.result;
}

export async function getTrainingVisits(characterId: number): Promise<TrainingVisit[]> {
  const { data } = await request('GET', { action: 'get_training_visits', character_id: characterId.toString() });
  return data.visits;
}

export async function recordGameResult(characterId: number, gameType: string, result: Record<string, unknown>) {
  const { data } = await request('POST', { action: 'record_game_result' }, {
    character_id: characterId,
    game_type: gameType,
    ...result,
  });
  return data.result;
}

export async function getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data } = await request('GET', { action: 'get_global_leaderboard' });
  return data.leaderboard;
}

export async function getPublicProfile(characterId: number): Promise<PublicProfile> {
  const { data } = await request('GET', { action: 'get_public_profile', character_id: characterId.toString() });
  return data.profile;
}

export async function getNotifications(characterId: number): Promise<CharacterNotification[]> {
  const { data } = await request('GET', { action: 'get_notifications', character_id: characterId.toString() });
  return data.notifications;
}

export async function markNotificationAsRead(notificationId: number) {
  const { data } = await request('POST', { action: 'mark_notification_read' }, {
    notification_id: notificationId,
  });
  return data.result;
}

export async function getAchievements(characterId: number): Promise<Achievement[]> {
  const { data } = await request('GET', { action: 'get_achievements', character_id: characterId.toString() });
  return data.achievements;
}

export async function getPurchasedItems(characterId: number): Promise<PurchasedItem[]> {
  const { data } = await request('GET', { action: 'get_purchased_items', character_id: characterId.toString() });
  return data.items;
}
