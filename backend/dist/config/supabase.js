"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
require("dotenv").config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or key is not set");
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
exports.supabase = supabase;
async function testConnection() {
    try {
        const { data, error } = await supabase.from("cart").select("*").limit(1);
        if (error) {
            console.error("Supabase connection error:", error);
        }
        else {
            console.log("Supabase connected successfully!", data);
        }
    }
    catch (err) {
        console.error("Connection test failed:", err);
    }
}
testConnection();
//# sourceMappingURL=supabase.js.map