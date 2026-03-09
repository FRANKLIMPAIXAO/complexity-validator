// Script para executar migrations no Supabase via DNS personalizado (Google 8.8.8.8)
import { Resolver } from 'dns';
import { promisify } from 'util';
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ALL_REGIONS = [
  'aws-0-us-east-1',
  'aws-0-us-west-1',
  'aws-0-us-west-2',
  'aws-0-eu-west-1',
  'aws-0-eu-west-2',
  'aws-0-eu-central-1',
  'aws-0-ap-southeast-1',
  'aws-0-ap-northeast-1',
  'aws-0-ap-south-1',
  'aws-0-sa-east-1',
  'aws-0-ca-central-1',
];

const PORT = 6543;
const USER = 'postgres.ccgwvtwvvyfhldrhvgyy';
const PASSWORD = 'Pac25Fp19PAC';
const DATABASE = 'postgres';

const resolver = new Resolver();
resolver.setServers(['8.8.8.8']);
const resolve4 = promisify(resolver.resolve4.bind(resolver));

async function resolveHost(host) {
  try {
    const addrs = await resolve4(host);
    return addrs[0];
  } catch (e) {
    return null;
  }
}

async function tryConnect(host, ip) {
  const { Client } = pg;
  const client = new Client({
    host: ip,
    port: PORT,
    user: USER,
    password: PASSWORD,
    database: DATABASE,
    ssl: { rejectUnauthorized: false, servername: host },
    connectionTimeoutMillis: 8000,
  });
  try {
    await client.connect();
    return client;
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log('=== PRAXIS — Encontrando região e conectando ===\n');

  // Resolver todas as regiões em paralelo
  const resolved = await Promise.all(
    ALL_REGIONS.map(async (region) => {
      const host = `${region}.pooler.supabase.com`;
      const ip = await resolveHost(host);
      return { region, host, ip };
    })
  );

  const available = resolved.filter(r => r.ip);
  console.log(`Regiões resolvidas: ${available.map(r => r.region).join(', ')}\n`);

  // Tentar conectar em cada região (em sequência para ver qual aceita)
  let client = null;
  let connectedHost = null;

  for (const { region, host, ip } of available) {
    process.stdout.write(`Tentando ${region}... `);
    const c = await tryConnect(host, ip);
    if (c) {
      console.log('✓ CONECTADO!');
      client = c;
      connectedHost = region;
      break;
    } else {
      console.log('✗ não encontrado');
    }
  }

  if (!client) {
    console.error('\n❌ Nenhuma região aceitou a conexão.');
    console.error('Possíveis causas:');
    console.error('  1. Senha incorreta (verifique em Settings → Database → Reset password)');
    console.error('  2. Projeto pausado (verifique no dashboard)');
    process.exit(1);
  }

  console.log(`\n✓ Projeto encontrado em: ${connectedHost}`);

  // Ler SQL consolidado
  const sqlPath = join(__dirname, 'supabase', 'EXECUTE_NO_SQL_EDITOR.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  console.log('Executando migrations...\n');
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✅ Todas as migrations aplicadas com sucesso!');
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Erro:', e.message);
    if (e.position) {
      const pos = parseInt(e.position);
      console.error('Contexto SQL:', sql.substring(Math.max(0, pos - 150), pos + 150));
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
