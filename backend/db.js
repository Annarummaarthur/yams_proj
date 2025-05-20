import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres('postgresql://postgres:Proj_yams33@db.ozzbjwhwmbylokultkik.supabase.co:5432/postgres');

export default sql;
