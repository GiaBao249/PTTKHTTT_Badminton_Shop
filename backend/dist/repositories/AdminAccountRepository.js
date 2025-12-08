"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAccountRepository = void 0;
const tsyringe_1 = require("tsyringe");
const supabase_1 = require("../config/supabase");
let AdminAccountRepository = class AdminAccountRepository {
    async findAll() {
        const { data, error } = await supabase_1.supabase
            .from("adminaccounts")
            .select(`
        id,
        username,
        employee_id,
        employees (
          name
        )
      `)
            .order("id", { ascending: true });
        if (error)
            throw error;
        return data ?? [];
    }
    async findById(accountId) {
        const { data, error } = await supabase_1.supabase
            .from("adminaccounts")
            .select(`
        id,
        username,
        employee_id,
        employees (
          name
        )
      `)
            .eq("id", accountId)
            .single();
        if (error)
            throw error;
        return data;
    }
};
exports.AdminAccountRepository = AdminAccountRepository;
exports.AdminAccountRepository = AdminAccountRepository = __decorate([
    (0, tsyringe_1.injectable)()
], AdminAccountRepository);
//# sourceMappingURL=AdminAccountRepository.js.map