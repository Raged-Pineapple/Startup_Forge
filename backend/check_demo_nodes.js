const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', 'StrongPassword123'),
    { encrypted: false }
);

async function checkNodes() {
    const session = driver.session();
    try {
        console.log("🔍 Checking Node Existence...");

        const investor = await session.run("MATCH (i:Investor {name: 'Eyal Gura'}) RETURN i");
        console.log("Investor 'Eyal Gura':", investor.records.length > 0 ? "✅ Found" : "❌ Not Found");

        const target = await session.run("MATCH (t:Company {name: 'Kapital'}) RETURN t");
        console.log("Target 'Kapital':", target.records.length > 0 ? "✅ Found" : "❌ Not Found");

    } catch (e) { console.error(e); }
    finally { await session.close(); driver.close(); }
}

checkNodes();
