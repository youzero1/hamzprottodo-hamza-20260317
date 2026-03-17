import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Todo } from '@/entities/Todo';
import path from 'path';

const DB_PATH = process.env.DATABASE_PATH
  ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
  : path.resolve(process.cwd(), './data/todos.db');

declare global {
  // eslint-disable-next-line no-var
  var __dataSource: DataSource | undefined;
}

let dataSource: DataSource;

if (process.env.NODE_ENV === 'production') {
  dataSource = new DataSource({
    type: 'better-sqlite3',
    database: DB_PATH,
    synchronize: true,
    logging: false,
    entities: [Todo],
  });
} else {
  if (!global.__dataSource) {
    global.__dataSource = new DataSource({
      type: 'better-sqlite3',
      database: DB_PATH,
      synchronize: true,
      logging: false,
      entities: [Todo],
    });
  }
  dataSource = global.__dataSource;
}

export async function getDataSource(): Promise<DataSource> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}

export default dataSource;
