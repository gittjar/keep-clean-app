<img src="https://digital.pictures.fi/kuvat/Github/keepclean-logo.png?img=full">

# Keep Clean

Reaaliaikainen WC-tilojen siisteyden seurantasovellus. Jokainen tila saa oman näyttölinkin, joka päivittyy automaattisesti siivouskirjausten mukaan.

## Teknologiat

| Kerros | Teknologia |
|---|---|
| Frontend | Angular 20 · Bootstrap 5 · FontAwesome |
| Backend | Node.js · Express · Mongoose |
| Tietokanta | MongoDB Atlas |
| Auth | JWT + PIN-koodi |

## Ominaisuudet

- 🟢 Värikoodattu tilaympyrä (vihreä → punainen ajan mukaan)
- 📋 Kortti- ja listanäkymä hallintapaneelissa
- 🔒 Roolipohjainen käyttöoikeuksien hallinta (admin / user / jaettu tila)
- 📺 Julkinen näyttötila TV/tabletti-käyttöön ilman kirjautumista
- 🧹 Siivoushistoria näyttötilassa liu'utettavana paneelina
- 🔍 Lajittelu, suodatus sijainneittain, hakutoiminnot

## Käynnistys

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && ng s -o
```

## Tekijä

Luotu: Jarno — Helsinki Business College DemoSession 2023  
Uudistettu ja laajennettu 2026 yhdessä **GitHub Copilotin** kanssa *(Claude Sonnet 4.6)*.
