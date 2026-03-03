import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-pricelist',
  templateUrl: './pricelist.component.html',
  styleUrls: ['./pricelist.component.css']
})
export class PricelistComponent {
  isAnnual = false;
  openFaq: number | null = 0;

  toggleFaq(i: number) {
    this.openFaq = this.openFaq === i ? null : i;
  }

  faqs = [
    {
      q: 'Sisältyvätkö näyttölaitteet hintaan?',
      a: 'Ei. Keep Clean on ohjelmistopalvelu – hinnoittelu kattaa vain sovelluksen käytön. Näyttölaitteet (tabletit, kosketusnäytöt, Android-näytöt) sekä niiden asennus ovat asiakkaan vastuulla ja kustannuksella. Suosittelemme edullisia Android-tabletteja (esim. Amazon Fire ~40 €) tai halvempia seinäkiinnitettäviä Android-näyttöjä.'
    },
    {
      q: 'Voinko vaihtaa pakettia myöhemmin?',
      a: 'Kyllä, voit päivittää tai alentaa pakettia koska tahansa. Muutos astuu voimaan seuraavan laskutusjakson alussa.'
    },
    {
      q: 'Mikä on PIN-koodi ja miten se toimii?',
      a: 'Jokainen siivoojakäyttäjä saa oman PIN-koodin. Siivottuaan wc-tilan hän syöttää PIN:in ovipielinäytöllä, jolloin ajastin nollautuu ja tila merkitään siivotuksi.'
    },
    {
      q: 'Toimiiko palvelu ilman internet-yhteyttä?',
      a: 'Palvelu vaatii internet-yhteyden reaaliaikaiseen synkronointiin. Offline-tila on suunnitteilla tulevaan versioon.'
    },
    {
      q: 'Miten laskutus toimii?',
      a: 'Laskutamme kuukausittain tai vuosittain (20 % alennus). Hyväksymme yleisimmät maksutavat: kortti, lasku ja verkkomaksu.'
    },
    {
      q: 'Onko saatavilla ilmainen kokeilujakso?',
      a: 'Kyllä! Kaikki paketit sisältävät 14 päivän ilmaisen kokeilujakson ilman luottokorttia.'
    }
  ];

  comparisonRows = [
    { name: 'WC-tilat', starter: '5', pro: '<strong>25</strong>', enterprise: '<strong>Rajaton</strong>' },
    { name: 'Siivoojat (PIN)', starter: '3', pro: '<strong>15</strong>', enterprise: '<strong>Rajaton</strong>' },
    { name: 'Reaaliaikainen näyttö', starter: '✓', pro: '✓', enterprise: '✓' },
    { name: 'Ajastimen nollaus', starter: '✓', pro: '✓', enterprise: '✓' },
    { name: 'Siivoushistoria', starter: '✗', pro: '90 pv', enterprise: 'Rajaton' },
    { name: 'Raportointi & CSV', starter: '✗', pro: '✓', enterprise: '✓' },
    { name: 'Mukautettu brändäys', starter: '✗', pro: '✗', enterprise: '✓' },
    { name: 'Tuki', starter: 'Sähköposti', pro: 'Prioriteetti', enterprise: '24/7 puhelin' },
    { name: 'Kokeilujakso', starter: '14 pv', pro: '14 pv', enterprise: 'Räätälöity' }
  ];
}
