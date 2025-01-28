import { QdrantClient } from '@qdrant/js-client-rest';

// Make sure your local Qdrant server is started using:
// docker run -p 6333:6333 qdrant/qdrant
const client = new QdrantClient({
    url: 'http://localhost:6333',
    // url: 'https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.us-east-0-1.aws.cloud.qdrant.io',
    // apiKey: '<your-api-key>',
});

const result = await client.getCollections()
console.info(`Found ${result.collections.length} collections`);
console.info(result.collections)


// CREATE
const collectionName = "default"
if (result.collections.map(m => m.name).includes(collectionName)) {
    await client.deleteCollection(collectionName);
    console.info(`Successfykky deleted:`, collectionName)
}
await client.createCollection(collectionName, {
    vectors: {
        size: 4,
        distance: 'Cosine',
    },
    optimizers_config: {
        default_segment_number: 2,
    },
    replication_factor: 2,
});
console.info("Created", collectionName)


// CONFIGURE
await client.createPayloadIndex(collectionName, {
    field_name: 'city',
    field_schema: 'keyword',
    wait: true,
});

await client.createPayloadIndex(collectionName, {
    field_name: 'count',
    field_schema: 'integer',
    wait: true,
});

await client.createPayloadIndex(collectionName, {
    field_name: 'coords',
    field_schema: 'geo',
    wait: true,
});


// INSERT
console.info(`Upserting data points...`);
await client.upsert(collectionName, {
    wait: true,
    points: [
        {
            id: 1,
            vector: [0.05, 0.61, 0.76, 0.74],
            payload: {
                city: 'Berlin',
                country: 'Germany',
                count: 1000000,
                square: 12.5,
                coords: { lat: 1.0, lon: 2.0 },
            },
        },
        { id: 2, vector: [0.19, 0.81, 0.75, 0.11], payload: { city: ['Berlin', 'London'] } },
        { id: 3, vector: [0.36, 0.55, 0.47, 0.94], payload: { city: ['Berlin', 'Moscow'] } },
        { id: 4, vector: [0.18, 0.01, 0.85, 0.8], payload: { city: ['London', 'Moscow'] } },
        { id: '98a9a4b1-4ef2-46fb-8315-a97d874fe1d7', vector: [0.24, 0.18, 0.22, 0.44], payload: { count: [0] } },
        { id: 'f0e09527-b096-42a8-94e9-ea94d342b925', vector: [0.35, 0.08, 0.11, 0.44] },
    ],
});


// QUERY
const queryVector = [0.2, 0.1, 0.9, 0.7];
const res2 = await client.search(collectionName, {
    vector: queryVector,
    limit: 3,
    filter: {
        must: [
            {
                key: 'city',
                match: {
                    value: 'Berlin',
                },
            },
        ],
    },
});

console.log('QUERY result with filter: ', res2);