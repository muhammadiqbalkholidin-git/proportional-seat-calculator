# Proportional Electoral Seat Calculator

**Proportional Electoral Seat Calculator** is an independent, browser-based web application for simulating proportional seat allocation and measuring vote-seat proportionality in electoral systems.

The tool allows users to compare how different proportional representation formulas convert votes into seats, inspect the calculation process, and calculate key proportionality indicators such as the Loosemore-Hanby Index, the Least Squares Index / Gallagher Index, and the Effective Number of Parliamentary Parties.

Live application:
https://proportional-seat-calculator.netlify.app/

Developed independently by **Muhammad Iqbal Kholidin**.

---

## Overview

Electoral systems shape how votes are translated into political representation. Different seat allocation formulas can produce different outcomes even when they use the same vote totals, number of seats, and electoral threshold.

This application was developed to support:

* electoral system research;
* public understanding of proportional representation;
* evidence-based policy discussion;
* teaching and learning on electoral formulas;
* transparent simulation of alternative electoral rules;
* comparative analysis of vote-seat conversion.

All calculations run locally in the user’s browser. No input data is sent to an external server.

---

## Key Features

### Proportional Seat Allocation Calculator

The main calculator simulates seat allocation using five proportional representation methods:

1. **Sainte-Laguë**
2. **Modified Sainte-Laguë**
3. **D’Hondt**
4. **Hare Quota**
5. **Droop Quota**

Users can:

* enter party vote data manually;
* import vote data from CSV;
* set the total number of seats;
* set an electoral threshold;
* use a DPR 2024 preset;
* compare results across five allocation methods;
* view results in table format;
* view results as a chart;
* inspect detailed calculation traces;
* download results as CSV;
* download charts as PNG;
* download full calculation traces as CSV.

---

### Proportionality Index Calculator

The application includes a dedicated proportionality index page for analyzing the relationship between vote share and seat share.

It calculates:

1. **Loosemore-Hanby Index (LHI)**
   Measures total absolute vote-seat deviation.

2. **Least Squares Index (LSI) / Gallagher Index**
   Measures vote-seat disproportionality by giving greater weight to larger deviations.

3. **Effective Number of Parliamentary Parties (ENPP)**
   Measures the effective number of parties in parliament based on seat distribution.

Users can:

* enter party vote and seat data manually;
* import vote-seat data from CSV;
* view vote percentage, seat percentage, and vote-seat gap;
* calculate LHI, LSI, and ENPP;
* inspect the calculation trace;
* download index results as CSV;
* download index calculation trace as CSV.

All proportionality index results are calculated from user-provided input and do not represent official election results.

---

### Multi-District / Multi-Dapil Calculator

Version 1.1.0 adds a dedicated **Multi-District / Multi-Dapil Calculator** for simulating proportional seat allocation across multiple electoral districts while applying a national parliamentary threshold.

The Multi-District Calculator:

* imports district-level vote data from CSV;
* supports both Indonesian and English CSV headers;
* calculates national vote totals by party;
* applies the national parliamentary threshold before district-level allocation;
* allocates seats separately in each district using five methods:
  * Sainte-Laguë;
  * Modified Sainte-Laguë;
  * D’Hondt;
  * Hare Quota;
  * Droop Quota;
* assigns 0 seats in all districts to parties that do not pass the national threshold;
* provides a National Summary table;
* provides a District Detail table with a district filter;
* provides CSV downloads for national and district-level results;
* includes validation for districts with zero total votes;
* includes validation for districts with no votes from parties passing the national threshold;
* includes reset and citation buttons on the Multi-District page.

The calculation order is important: the national threshold is applied first, and district-level seat allocation is performed afterward only among eligible parties.

---

## Supported Languages

The application supports two interface languages:

* Indonesian
* English

Users can switch languages directly from the navigation bar.

---

## CSV Input Format

### Main Seat Allocation Calculator

The main calculator accepts CSV files with the following columns:

```csv
nama,suara
PDIP,25511655
Golkar,23687039
Gerindra,20321826
```

The parser supports both comma-separated and semicolon-separated files.

---

### Proportionality Index Calculator

The proportionality index calculator accepts Indonesian headers:

```csv
partai,suara,kursi
Partai A,1000000,40
Partai B,800000,30
Partai C,500000,20
Partai D,200000,10
```

It also accepts English headers:

```csv
party,votes,seats
Party A,1000000,40
Party B,800000,30
Party C,500000,20
Party D,200000,10
```

---

### Multi-District / Multi-Dapil Calculator

The Multi-District Calculator accepts CSV files with the following English headers:

```csv
district,seats,party,votes
District 1,7,Party A,100000
District 1,7,Party B,85000
District 2,10,Party A,150000
District 2,10,Party B,90000
```

Indonesian headers are also supported:

```csv
dapil,kursi,partai,suara
Jabar 1,7,Partai A,100000
Jabar 1,7,Partai B,85000
Jabar 2,10,Partai A,150000
Jabar 2,10,Partai B,90000
```

Required columns:

* `district` / `dapil`: electoral district name;
* `seats` / `kursi`: number of seats in the district;
* `party` / `partai`: party name;
* `votes` / `suara`: party votes in that district.

Vote and seat values must be numeric. Districts with seats but zero total votes are rejected because seat allocation is not mathematically meaningful in that condition.

---

## Methodology

### 1. Sainte-Laguë

Sainte-Laguë is a divisor method that allocates seats by dividing each party’s vote total by a sequence of odd-numbered divisors.

```text
Divisors = 1, 3, 5, 7, 9, ...
```

The highest quotients receive seats until all seats are allocated.

Sainte-Laguë is often considered more proportional than D’Hondt because it is less favorable to larger parties.

---

### 2. Modified Sainte-Laguë

Modified Sainte-Laguë uses the same divisor sequence as Sainte-Laguë, except that the first divisor is changed from 1 to 1.4.

```text
Divisors = 1.4, 3, 5, 7, 9, ...
```

This modification slightly increases the effective barrier for smaller parties to win their first seat.

---

### 3. D’Hondt

D’Hondt is a divisor method using consecutive integer divisors.

```text
Divisors = 1, 2, 3, 4, 5, ...
```

Compared with Sainte-Laguë, D’Hondt tends to produce more favorable outcomes for larger parties.

---

### 4. Hare Quota

Hare Quota is a quota-based allocation method. It first calculates a quota by dividing total valid votes by the number of seats.

```text
Quota = Total Votes / Total Seats
```

Each party receives an initial number of seats based on how many full quotas it obtains. Remaining seats are allocated to parties with the largest remainders.

---

### 5. Droop Quota

Droop Quota is another quota-based method, commonly associated with proportional allocation systems.

```text
Quota = floor(Total Votes / (Total Seats + 1)) + 1
```

As with Hare Quota, seats are first allocated using full quotas, and remaining seats are distributed according to the largest remainders.

---

## Proportionality Index Methodology

### Loosemore-Hanby Index

The Loosemore-Hanby Index measures overall disproportionality by summing the absolute differences between vote percentage and seat percentage, then dividing the total by two.

```text
LHI = 0.5 × Σ |Vote % − Seat %|
```

A lower LHI value indicates a smaller aggregate gap between vote share and seat share.

---

### Least Squares Index / Gallagher Index

The Least Squares Index, also known as the Gallagher Index, measures disproportionality by squaring each vote-seat deviation, summing the squared deviations, dividing by two, and taking the square root.

```text
LSI = √(0.5 × Σ (Vote % − Seat %)²)
```

Because deviations are squared, the LSI gives greater weight to larger vote-seat gaps.

---

### Effective Number of Parliamentary Parties

The Effective Number of Parliamentary Parties measures how many relevant parties exist in parliament based on seat distribution.

```text
ENPP = 1 / Σ Seat Share²
```

ENPP uses seat shares in decimal form, not percentages.

---

## Multi-District / Multi-Dapil Methodology

The Multi-District Calculator is designed for simulations in which seat allocation is performed separately across multiple electoral districts, while the parliamentary threshold is applied nationally.

The calculation follows this order:

1. Read all district-level vote data.
2. Aggregate votes nationally by party.
3. Calculate each party’s national vote percentage.
4. Determine which parties pass the national threshold.
5. Allocate seats separately in each district only among parties that pass the national threshold.
6. Assign 0 seats to parties that do not pass the national threshold in all districts.
7. Aggregate district-level seat results into national totals.

This order avoids a common methodological error: allocating seats by district first and applying the national threshold afterward. In this tool, the threshold is calculated first at the national level, and district-level allocation is then performed only among eligible parties.

For each district, the calculator applies the selected allocation formulas using only votes received by parties that pass the national threshold. Parties that fail to pass the threshold remain visible in the output table for transparency, but their seat totals are set to 0.

The Multi-District Calculator includes validation to stop calculation when:

* a district has seats but zero total votes;
* a district has seats but no votes from parties passing the national threshold;
* vote or seat values in the uploaded CSV are invalid.

These validation rules help prevent mathematically invalid or misleading outputs.

---

## Calculation Transparency

The application includes calculation trace features for both the seat allocation calculator and the proportionality index calculator.

The trace feature is designed to make the calculation process auditable by showing:

* eligible parties after threshold filtering;
* quotient ranking for divisor methods;
* quota calculation for quota methods;
* initial seat allocation;
* remainder-based seat allocation;
* vote share;
* seat share;
* vote-seat gap;
* LHI components;
* LSI components;
* ENPP components.

This makes the application useful not only for quick simulation, but also for teaching, verification, and policy analysis.

---

## Intended Use

This application is intended for:

* electoral system simulation;
* academic research;
* civic education;
* policy discussion;
* journalism and public communication;
* classroom teaching;
* advocacy and reform analysis;
* comparative study of electoral formulas.

The application is an independent educational and research tool. It is not affiliated with any election management body and does not produce official election results.

---

## Limitations

The calculator is designed for formula-based simulation. It does not automatically account for all institutional, legal, or administrative rules that may exist in a specific electoral system.

Users should carefully verify whether additional rules apply in their context, such as:

* district-level allocation rules;
* multi-tier compensation mechanisms;
* reserved seats;
* legal rounding rules;
* alliance rules;
* candidate-level allocation;
* overhang or leveling seats;
* special representation provisions.

The results should therefore be interpreted as formula-based simulations based on the input data provided by the user.

---

## Privacy and Data Handling

This is a client-side web application. All calculations are performed in the browser.

The application does not:

* upload user input data to a server;
* store user input data externally;
* require login;
* use a database;
* process personal data through a backend system.

---

## Technology

The application is built as a static web application using:

* HTML
* CSS
* JavaScript
* Chart.js

It can be hosted on static hosting platforms such as Netlify.

---

## Local Use

Because the application is a static HTML-based tool, it can be opened locally in a browser.

Basic use:

```bash
git clone <repository-url>
cd <repository-folder>
open index.html
```

Alternatively, users may run a local static server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

---

## Version History

### v1.1.0 — Multi-District Calculator Update

This release adds the Multi-District / Multi-Dapil Calculator and strengthens validation for district-level simulations.

Added:

* Multi-District / Multi-Dapil Calculator;
* CSV import and CSV template for district-level data;
* national parliamentary threshold calculation before district-level allocation;
* district-level allocation using Sainte-Laguë, Modified Sainte-Laguë, D’Hondt, Hare Quota, and Droop Quota;
* National Summary output;
* District Detail output with district filter;
* CSV downloads for Multi-District results;
* threshold information box;
* reset and citation buttons on the Multi-District page.

Improved:

* validation for districts with seats but zero total votes;
* validation for districts with no votes from parties passing the national threshold;
* validation for vote and seat values in Multi-District CSV import;
* language re-rendering for Multi-District result panels.

---

## Citation

If you use this application in academic writing, policy analysis, teaching material, journalism, presentations, or public documentation, please cite it as follows.

### APA

```text
Kholidin, M. I. (2026). Kalkulator Kursi Pemilu Proporsional / Proportional Electoral Seat Calculator [Web application]. https://proportional-seat-calculator.netlify.app/
```

### BibTeX

```bibtex
@misc{kholidin2026seatcalculator,
  author = {Kholidin, Muhammad Iqbal},
  title = {Kalkulator Kursi Pemilu Proporsional / Proportional Electoral Seat Calculator},
  year = {2026},
  url = {https://proportional-seat-calculator.netlify.app/},
  note = {Web application}
}
```

---

## Developer

**Muhammad Iqbal Kholidin**
Electoral Researcher · Policy Analyst

LinkedIn:
https://www.linkedin.com/in/muhammadiqbalkholidin/

Email:
[muhammadiqbalkholidin@gmail.com](mailto:muhammadiqbalkholidin@gmail.com)

---

## License and Copyright

© 2026 Muhammad Iqbal Kholidin. All Rights Reserved.

This repository is publicly visible for documentation, transparency, and portfolio purposes. It is not an open-source project unless a separate open-source license is added in the future.

The source code may not be reused, modified, redistributed, republished, sublicensed, sold, or used to create derivative works without prior written permission from the author.

For permission requests, contact Muhammad Iqbal Kholidin at [muhammadiqbalkholidin@gmail.com](mailto:muhammadiqbalkholidin@gmail.com).

---

## Disclaimer

This tool is provided for research, education, and public discussion. It should not be treated as an official electoral result system. All outputs depend on the data entered by the user and the formulas selected in the application.
