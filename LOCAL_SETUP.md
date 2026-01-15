# Local Development with SQLite

This guide explains how to switch from in-memory database to SQLite for local development.

## 🗄️ **Current Setup**

- **Cloud/Container**: In-memory database (works everywhere)
- **Local PC**: Can easily switch to SQLite for persistent data

## 🔄 **Switching to SQLite**

### 1. Install SQLite Dependencies

```bash
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
```

### 2. Update Database Import

In `server/routes/auth.ts` and `server/routes/links.ts`, change:

```typescript
// FROM:
import { db } from "../database";

// TO:
import { db } from "../database-sqlite";
```

### 3. Alternative: Use Database Factory

Update your route files to use the factory:

```typescript
// In server/routes/auth.ts and server/routes/links.ts
import { db } from "../database-factory";
```

Then in `server/database-factory.ts`, uncomment the SQLite lines:

```typescript
import { sqliteDb } from "./database-sqlite";
export const db = sqliteDb;
```

## ✅ **Benefits of SQLite Setup**

### **Local Development**

- ✅ **Persistent data** - survives server restarts
- ✅ **Real database** - same SQL features as production
- ✅ **Local file** - `affiliate.db` in project root
- ✅ **Better testing** - can inspect data with DB browser

### **Production Ready**

- ✅ **Easy migration** - same interface, different backend
- ✅ **PostgreSQL ready** - similar SQL patterns
- ✅ **Scalable** - can switch to cloud DBs later

## 🔧 **Database Interface**

Both implementations use the **exact same methods**:

```typescript
// Admin methods
await db.createAdmin(businessName, email, password, firstName, lastName);
db.getAdmin();
await db.validateAdmin(email, password);

// Partner methods
db.createPartner(email, firstName, lastName, commissionRate);
db.getAllPartners();
db.getPartnerStats(partnerId);

// Link methods
db.createAffiliateLink(partnerId, url, title, description);
db.getAffiliateLinksByPartner(partnerId);
db.trackClick(linkId, partnerId, ipAddress, userAgent, referrer);
db.trackConversion(linkId, partnerId, amount, orderId);
```

## 🚀 **Recommended Workflow**

### **For Local Development:**

1. Install `better-sqlite3`
2. Switch to `database-sqlite.ts`
3. Get persistent data and real SQL features

### **For Cloud Deployment:**

1. Keep using `database.ts` (in-memory)
2. No native bindings issues
3. Works in any containerized environment

### **For Production:**

1. Easy to migrate to PostgreSQL/MySQL
2. Same interface, just change the implementation
3. Professional database features

## 📁 **File Structure**

```
server/
├── database.ts          # In-memory (current)
├── database-sqlite.ts   # SQLite version
├── database-factory.ts  # Easy switching
└── routes/
    ├── auth.ts
    └── links.ts
```

## 🛠️ **Migration Path**

**Phase 1 (Current)**: In-memory database
**Phase 2 (Local)**: SQLite database  
**Phase 3 (Production)**: PostgreSQL/MySQL with same interface

The beauty is that **no business logic changes** - just swap the database implementation!
