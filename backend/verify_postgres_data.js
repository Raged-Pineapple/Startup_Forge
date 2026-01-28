const pool = require('./db');

async function verifyData() {
    console.log("🔍 Verifying PostgreSQL Data for APIs...");
    const client = await pool.connect();
    try {
        // 1. Verify Login Data (Mark Suster)
        const loginRes = await client.query("SELECT * FROM investors WHERE name = 'Mark Suster'");
        if (loginRes.rows.length > 0) {
            console.log("✅ Login Check (Investor): Found Mark Suster");
        } else {
            console.error("❌ Login Check (Investor): Mark Suster NOT found");
        }

        // 2. Verify Founder Data (1upHealth)
        const founderRes = await client.query("SELECT * FROM founders WHERE company = '1upHealth' OR name = '1upHealth'"); // CSV might put company in name
        if (founderRes.rows.length > 0) {
            console.log("✅ Login Check (Founder): Found 1upHealth");
            console.log("   Details:", founderRes.rows[0]);
        } else {
            // Try fuzzy
            const fuzzy = await client.query("SELECT * FROM founders WHERE name ILIKE '%1upHealth%'");
            if (fuzzy.rows.length > 0) {
                console.log("⚠️ Found 1upHealth via fuzzy search:", fuzzy.rows[0].name);
            } else {
                console.error("❌ Login Check (Founder): 1upHealth NOT found");
            }
        }

        // 3. Verify Profile Data Requirements (simulate /api/users/:id)
        // We need: id, name, company/firm, role, location, about, avatar, tags
        if (loginRes.rows.length > 0) {
            const u = loginRes.rows[0];
            const profileOk = u.name && u.firm_name;
            console.log(`ℹ️ Investor Profile completeness: ${profileOk ? 'OK' : 'Incomplete'}`);
        }

        // 4. Verify Network Lists
        const invList = await client.query("SELECT COUNT(*) FROM investors");
        const fndList = await client.query("SELECT COUNT(*) FROM founders");
        console.log(`📊 Stats: ${invList.rows[0].count} Investors, ${fndList.rows[0].count} Founders`);

        // 5. Verify Connections
        const connList = await client.query("SELECT COUNT(*) FROM connections");
        console.log(`🔗 Stats: ${connList.rows[0].count} Connections`);

    } catch (e) {
        console.error("❌ Verification Failed:", e);
    } finally {
        client.release();
    }
}

verifyData();
