import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'infrastructure/data/myWallet.json');

export async function GET() {
  try {
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return NextResponse.json(JSON.parse(jsonData));
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lecture fichier' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newData = await request.json();
    if (!Array.isArray(newData)) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2), 'utf-8');
    return NextResponse.json({ message: 'myWallet sauvegardé avec succès' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur sauvegarde fichier' }, { status: 500 });
  }
}
