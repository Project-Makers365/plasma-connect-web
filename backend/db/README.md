# Database Migrations

Migration files are in `db/migrations` and are applied in lexical order.

## Run migrations

```bash
npm run db:migrate
```

## Notes
- Applied migrations are tracked in `schema_migrations` table.
- Each migration file exports `up(queryInterface, DataTypes, transaction)`.
