/**
 * Copyright (c) 2021 Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential.
 */

import { ZynLogger }         from "../../zynaptic-session/src/common/zyn-logger";
import { Sqlite3Db }         from './sqlite3-db';
import { ISqlite3DbHandler } from './sqlite3-db-handler';
import { SqliteDbType }      from './sqlite3-db.type';
import fs                    from 'fs';
import path                  from 'path';

export class DbHandlerBase implements ISqlite3DbHandler {
	db: Sqlite3Db;
	dbFilename: string;
	dbFullFilename: string;

	constructor() {
	}

	public async initDatabase(
		dbFilename: string,
		dbType         = SqliteDbType.Sqlite,
		dbPath: string = undefined
	): Promise<boolean> {
		let result = false;
		console.log("HIPPIHAPPI HOPP ::", )
		try {
			this.dbFilename     = path.basename(dbFilename);
			this.dbFullFilename = dbFilename;

			if (!fs.existsSync(this.dbFullFilename)) {
				throw new Error(`initDatabase :: database "${ this.dbFullFilename }" does not exist.`);
			}

			this.db = new Sqlite3Db(dbType, this.dbFullFilename);
			result = await this.db.connect();
		}
		catch (e) {
			console.log('initDatabase', e);
			result = false;
		}

		return result;
	}

	public async execute(query: string, ...values: unknown[]): Promise<any> {
		let result: any = null;
		console.log("EXECUTE :: VALUES ::", values);

		const isSelect = query.toLowerCase().trim().startsWith("select");

		try {
			let connectResult: boolean = false;

			if (this.db) {
				connectResult = await this.db.connect();
				if (!connectResult) throw new Error("");
			}
			else {
				throw new Error(`Unable to connect database "${ this.dbFilename }"`);
			}

			if (isSelect) {
				console.log("EXECUTE :: SELECT ::", values);
				result = await this.db.dbGet(query, values);
			}
			else {
				console.log("EXECUTE :: MODIFY ::", values);
				result = await this.db.modify(query, values);
			}
		}
		catch (e) {
			console.log("ZynDbBase ::", e);
		}

		return result;
	}
}