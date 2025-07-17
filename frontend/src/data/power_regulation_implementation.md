# Power Regulation Sheet Implementation Guide

## 🔌 STEP 1: PLACE THE ICs

### Voltage Regulator ICs (Place These First):

**U1: ICL7660SCPAZ**
- **Function:** 12V → -12V charge pump inverter
- **Package:** SOIC-8 
- **Symbol:** Look for "ICL7660" in KiCAD libraries
- **Alternative Symbol:** Generic "Charge_Pump" if ICL7660 not available

**U2: TPS54531DDAR** 
- **Function:** 12V → 5V switching regulator
- **Package:** SO-8 PowerPAD
- **Symbol:** Look for "TPS54531" in KiCAD libraries
- **Alternative Symbol:** Generic "Buck_Converter" or create custom

**U3: LT3045MPMS8E-PBF**
- **Function:** 12V → 3.3V ultra-low noise linear
- **Package:** MSOP-8
- **Symbol:** Look for "LT3045" or use generic "Linear_Regulator_3_Terminal"
- **Alternative Symbol:** Generic LDO with EN pin

**U4: TPS7A0230PDBVR**
- **Function:** 3.3V → 1V precision linear  
- **Package:** SOT-23-5
- **Symbol:** Look for "TPS7A0230" or use "SOT-23-5_Linear_Regulator"
- **Alternative Symbol:** Generic adjustable LDO

---

## 🛡️ STEP 2: PROTECTION COMPONENTS

### F1: 4A Slow-Blow Fuse
- **Rating:** 4A, 32V, Slow-Blow
- **Package:** 5×20mm cartridge fuse
- **Fuse Holder:** Through-hole or panel mount
- **Part Example:** Littelfuse 0215004.MXP (4A slow-blow)

### Output Protection Zener Diodes:

**D2: 15V Zener (±12V Rails)**
- **Part:** 1N4744A or BZX79C15
- **Package:** DO-41 or SOD-123
- **Power:** 1W minimum
- **Function:** Protects ±12V rails from overvoltage

**D3: 6.8V Zener (5V Rail)**  
- **Part:** 1N4736A or BZX79C6V8
- **Package:** DO-41 or SOD-123  
- **Power:** 1W minimum
- **Function:** Protects 5V rail from overvoltage

**D4: 4.3V Zener (3.3V Rail)**
- **Part:** 1N4731A or BZX79C4V3
- **Package:** DO-41 or SOD-123
- **Power:** 1W minimum  
- **Function:** Protects 3.3V rail from overvoltage

**D5: 1.5V Zener (1V Rail)**
- **Part:** BZX84C1V5 or MMSZ1V5T1G
- **Package:** SOT-23 or SOD-123
- **Power:** 500mW minimum
- **Function:** Protects 1V rail from overvoltage

---

## 🔋 STEP 3: BYPASS CAPACITORS BY RAIL

### Battery Input Filtering (+12V_BATT):
- **C1:** 3300µF, 25V (Primary bulk - electrolytic)
- **C2:** 470µF, 25V (Secondary bulk - low ESR electrolytic)  
- **C3:** 47µF, 25V (Medium frequency - ceramic X7R)
- **C4:** 4.7µF, 25V (Higher frequency - ceramic X7R)
- **C5:** 0.1µF, 50V (High frequency - ceramic X7R)

### ICL7660 (U1) Bypass Capacitors:
**Input Side (VDD):**
- **C6:** 10µF, 25V (VDD bulk)
- **C7:** 0.1µF, 25V (VDD high frequency)

**Charge Pump:**
- **C8:** 10µF, 25V (External charge pump capacitor)

**Output Side (-12V):**
- **C9:** 10µF, 25V (Output bulk)
- **C10:** 0.1µF, 25V (Output high frequency)

### TPS54531 (U2) Bypass Capacitors:
**Input Side (VIN):**
- **C11:** 47µF, 25V (Input bulk - low ESR)
- **C12:** 10µF, 25V (Input medium frequency)
- **C13:** 0.1µF, 50V (Input high frequency)

**Output Side (5V):**
- **C14:** 220µF, 10V (Output bulk - low ESR)
- **C15:** 22µF, 10V (Output medium frequency)
- **C16:** 0.1µF, 10V (Output high frequency)

### LT3045 (U3) Bypass Capacitors:
**Input Side (VIN):**
- **C17:** 100µF, 25V (Input bulk - tantalum preferred)
- **C18:** 10µF, 25V (Input medium frequency)
- **C19:** 1µF, 25V (Input high frequency)
- **C20:** 0.1µF, 25V (Input very high frequency)

**Output Side (3.3V):**
- **C21:** 100µF, 10V (Output bulk - low ESR tantalum)
- **C22:** 22µF, 10V (Output medium frequency)
- **C23:** 4.7µF, 10V (Output high frequency)
- **C24:** 0.1µF, 10V (Output very high frequency)
- **C25:** 0.01µF, 10V (Output ultra high frequency - C0G)

### TPS7A0230 (U4) Bypass Capacitors:
**Input Side (VIN from 3.3V):**
- **C26:** 22µF, 10V (Input bulk)
- **C27:** 4.7µF, 10V (Input medium frequency)
- **C28:** 0.1µF, 10V (Input high frequency)

**Output Side (1V):**
- **C29:** 47µF, 10V (Output bulk - low ESR)
- **C30:** 10µF, 10V (Output medium frequency)
- **C31:** 1µF, 10V (Output high frequency)
- **C32:** 0.1µF, 10V (Output very high frequency)

### Filtered +12V Output:
- **C33:** 470µF, 25V (Bulk filtering)
- **C34:** 100µF, 25V (Medium frequency)  
- **C35:** 10µF, 25V (Higher frequency)
- **C36:** 0.1µF, 25V (High frequency)

---

## ⚡ STEP 4: ADDITIONAL COMPONENTS

### TPS54531 Power Components:
- **L1:** 47µH power inductor (Würth 744777247)
- **D1:** 5A Schottky diode (MBRS540T3G)

### Feedback Resistors:
- **R2:** 10.2kΩ (TPS54531 feedback upper)
- **R3:** 1.96kΩ (TPS54531 feedback lower)
- **R4:** 49.9kΩ (LT3045 SET pin for 3.3V)
- **R5:** 124kΩ (TPS7A0230 feedback upper for 1V)
- **R6:** 49.9kΩ (TPS7A0230 feedback lower for 1V)

### Star Ground Connection:
- **R1:** 0Ω resistor, 0603 package (AGND ↔ DGND connection)

### Soft Start (if needed):
- **C37:** 100nF (TPS54531 soft start capacitor)

**Total Capacitors:** 37 (comprehensive power filtering)
**Total Resistors:** 6 + 1 jumper  
**Total Protection:** 1 fuse + 4 zener diodes