import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase";
import { authRequired } from "../middleware/authRequired";
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

// post login account
// database -(query user)-> người dùng đăng nhập -(thành công)-> tạo token(jwt) -> return token + user information
router.post("/login", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    if (!["admin", "user"].includes(role))
      return res.status(401).json({ error: "Invalid role" });
    let dbTable: string, joinTable: string, idField: string, nameField: string;
    if (role === "user") {
      dbTable = "customeraccounts";
      joinTable = "customer";
      idField = "customer_id";
      nameField = "customer_name";
    } else {
      dbTable = "adminaccounts";
      joinTable = "employees";
      idField = "employee_id";
      nameField = "name";
    }

    const { data: AccountRow, error } = await supabase
      .from(dbTable)
      .select(`username , password , ${idField} , ${joinTable} (${nameField})`)
      .eq("username", username)
      .single();
    if (error || !AccountRow) {
      return res.status(401).json({
        error: "Không đăng nhập được vui lòng kiểm tra lại thông tin",
      });
    }
    const account: any = AccountRow;
    let passwordMatching: boolean;
    if (account.password.startsWith("$2b$")) {
      passwordMatching = await bcrypt.compare(password, account.password);
    } else {
      passwordMatching = password === account.password;
      if (passwordMatching) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await supabase
          .from(dbTable)
          .update({ password: hashedPassword })
          .eq("username", username);
      }
    }

    if (!passwordMatching) {
      return res.status(401).json({ error: "Password không đúng " });
    }
    const token = jwt.sign(
      {
        username: account.username,
        role,
        id: account[idField],
      },
      JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      username: account.username,
      role,
      id: account[idField],
      name: account[joinTable]?.[nameField],
    });
  } catch (err) {
    res.status(401).json({ error: "Lỗi Server" });
  }
});

//get login (protected)
router.get("/me", authRequired, async (req, res) => {
  const user = (req as any).user;
  res.json({ username: user.username, role: user.role, id: user.id });
});
// post register
// Information (form)
// -> Validate inputs
// -> Check username already exists in database
// -> Hash password (bcrypt)
// -> Insert to customer/employee table (lấy ID)
// -> Insert to customeraccounts/adminaccounts table (với foreign key)
// -> Create JWT token
// -> Return token + user info (auto login sau register)
router.post("/register", async (req, res) => {
  const { username, password, role, name, phone, gender } = req.body;
  try {
    if (!["admin", "user"].includes(role))
      return res.status(401).json({ error: "Invalid role" });
    if (!username || !password || !role || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    let accountTable: string,
      infoTable: string,
      idField: string,
      infoIdField: string;
    if (role === "user") {
      accountTable = "customeraccounts";
      infoTable = "customer";
      idField = "customer_id";
      infoIdField = "customer_id";
    } else {
      accountTable = "adminaccounts";
      infoTable = "employees";
      idField = "employee_id";
      infoIdField = "employ_id";
    }
    const { data: existingUser } = await supabase
      .from(accountTable)
      .select("username")
      .eq("username", username)
      .single();
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const infoData =
      role === "user"
        ? {
            customer_name: name,
            customer_phone: phone,
            customer_gender: gender,
          }
        : { name: name, phone: phone };

    const { data: insertedInfo, error: infoError } = await supabase
      .from(infoTable)
      .insert([infoData])
      .select()
      .single();
    if (infoError) {
      //console.error("Insert info error:", infoError);
      return res.status(500).json({ error: "Tạo tài khoản không thành công" });
    }

    const newId = insertedInfo[infoIdField];
    const { error: accountError } = await supabase.from(accountTable).insert([
      {
        username: username,
        password: hashedPassword,
        [idField]: newId,
      },
    ]);

    if (accountError) {
      // console.error("Account error:", accountError);
      await supabase.from(infoTable).delete().eq(infoIdField, newId);
      return res.status(500).json({ error: "Tạo tài khoản không thành công" });
    }
    const token = jwt.sign(
      {
        username: username,
        role: role,
        id: newId,
      },
      JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Đăng ký thành công",
      token: token,
      user: {
        id: newId,
        username: username,
        role: role,
        name: name,
      },
    });
  } catch (err) {
    return res.status(401).json({ error: "Lỗi Server" });
  }
});

export default router;
