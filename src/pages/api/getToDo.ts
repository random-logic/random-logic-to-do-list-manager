import { MongoClient } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const uri =
    "mongodb+srv://admin:1234@cluster0.itt5rhj.mongodb.net/?retryWrites=true&w=majority";

  // The MongoClient is the object that references the connection to our
  // datastore (Atlas, for example)
  const client = new MongoClient(uri);

  // The connect() method does not attempt a connection; instead it instructs
  // the driver to connect using the settings provided when a connection
  // is required.
  await client.connect();

  // Provide the name of the database and collection you want to use.
  // If the database and/or collection do not exist, the driver and Atlas
  // will create them automatically when you first write data.
  const dbName = "App";
  const collectionName = "ToDo";

  // Create references to the database and collection in order to run
  // operations on them.
  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  /*
   * *** FIND DOCUMENTS ***
   *
   * Now that we have data in Atlas, we can read it. To retrieve all of
   * the data in a collection, we call Find() with an empty filter.
   * The Builders class is very helpful when building complex
   * filters, and is used here to show its most basic use.
   */

  const findQuery = {
    completed : {
      $eq: req.query.completed == 'true'
    }
  };

  try {
    const [cursor] = await Promise.all([collection.find(findQuery)]);
    const data : any[] = [];

    while (await cursor.hasNext()) {
      data.push(await cursor.next());
    }

    await client.close();
    res.status(200).json(data);
  } catch (err) {
    await client.close();
    res.status(500).json(err);
  }
}
