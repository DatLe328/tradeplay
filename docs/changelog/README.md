# 📦 Versioning (vMAJOR.MINOR.PATCH)

This project uses a versioning convention in the following format:

vMAJOR.MINOR.PATCH  
(example: `v1.0.0`)

Each number carries its own specific meaning as follows:

## 🔴 MAJOR (first number)

Example: **v1.0.0 → v2.0.0**

- Represents a **major stable release**
- Contains **important changes or breaking changes to backward compatibility**
- May require:
  - API updates
  - Configuration changes
  - Data migration

👉 When this number increases, users **must carefully read the changelog before upgrading**.

---

## 🟡 MINOR (second number)

Example: **v1.0.0 → v1.1.0**

- Adds **new features**
- Improves logic and performance
- **Does not break** existing functionality
- Can be enabled/disabled via configuration

👉 Users **can upgrade safely**, no need to modify old code.

---

## 🟢 PATCH (last number)

Example: **v1.1.0 → v1.1.1**

- Bug fixes
- Security patches
- Minor corrections and hotfixes

👉 No new features added, just makes the system **more stable**.

---

## 🧪 Unstable Releases (optional)

In some cases, the project may use:

- `v1.2.0-beta`
- `v1.2.0-rc.1`

These versions **are only for testing**, not recommended for production use.

---

## 📌 Examples

| Version  | Meaning                    |
| -------- | -------------------------- |
| `v1.0.0` | First stable release       |
| `v1.1.0` | New features added         |
| `v1.1.3` | Bug fix                    |
| `v2.0.0` | Major breaking changes     |

---

## 📚 Related Documentation

- See detailed changes at: [CHANGELOG.md](../../CHANGELOG.md)
