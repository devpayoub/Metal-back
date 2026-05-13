# Manual API tests (curl)

Set `BASE` once:

```bash
BASE=http://localhost:4000
```

Every protected call needs `Authorization: Bearer $TOKEN` — get one with `login` below.

---

## Health

```bash
curl $BASE/api/health
```

## Auth

Register:
```bash
curl -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123","full_name":"Alice","role":"client"}'
```

Login:
```bash
TOKEN=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}' | jq -r '.data.access_token')
echo "$TOKEN"
```

Me:
```bash
curl $BASE/api/auth/me -H "Authorization: Bearer $TOKEN"
```

Logout:
```bash
curl -X POST $BASE/api/auth/logout -H "Authorization: Bearer $TOKEN"
```

## Profile

```bash
curl $BASE/api/profile -H "Authorization: Bearer $TOKEN"

curl -X PUT $BASE/api/profile \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"phone":"+216 12 345 678","address":"Tunis"}'

# Avatar upload (image required: jpg/png/webp/gif/avif, ≤5 MB)
curl -X POST $BASE/api/profile/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./avatar.png"
```

## Products

```bash
curl $BASE/api/products
curl $BASE/api/products?category=steel
curl $BASE/api/products/<id>

# Admin operations:
curl -X POST $BASE/api/products \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"H-Beam IPN 200","price":890.5,"stock":15,"category":"beams"}'

curl -X POST $BASE/api/products/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./beam.jpg"

curl -X PUT $BASE/api/products/<id> \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"stock":20}'

curl -X DELETE $BASE/api/products/<id> \
  -H "Authorization: Bearer $TOKEN"
```

## Employers

```bash
curl $BASE/api/employers

curl -X POST $BASE/api/employers \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"full_name":"Karim B.","role":"Welder","email":"karim@mis.tn"}'
```

## Projects

```bash
curl $BASE/api/projects

curl -X POST $BASE/api/projects \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Sfax Warehouse","description":"6000 m²","location":"Sfax","year":2025}'

curl -X POST $BASE/api/projects/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@./img1.jpg" -F "files=@./img2.jpg"
```

## Announcements

```bash
curl $BASE/api/announcements
curl "$BASE/api/announcements?type=job"

curl -X POST $BASE/api/announcements \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Hiring welder","body":"Apply now","type":"job"}'
```
