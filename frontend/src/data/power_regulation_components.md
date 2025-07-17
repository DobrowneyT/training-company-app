# Power Regulation Sheet - Complete Component List

## 🔌 VOLTAGE REGULATOR ICs

### U1: ICL7660SCPAZ (12V → -12V Inverter)
**Function:** Charge pump voltage inverter for op-amp negative supply  
**Package:** SOIC-8  
**Output:** -12V @ 100mA  

**Required Bypass Capacitors:**
- **C1:** 10µF, 25V (VDD input bulk)
- **C2:** 10µF, 25V (charge pump capacitor, external)
- **C3:** 10µF, 25V (VOUT output bulk)
- **C4:** 0.1µF, 25V (VDD high frequency bypass)
- **C5:** 0.1µF, 25V (VOUT high frequency bypass)

## 🛡️ PROTECTION COMPONENTS

### F1: 3A Slow-Blow Fuse 
**Function:** Primary overcurrent protection for entire system  
**Location:** Immediately after +12V_BATT hierarchical label  
**Package:** 5×20mm fuse holder  
**Part:** Littelfuse 0215003.MXP or equivalent  

### Power Rail Overvoltage Protection:
- **D2:** 15V Zener diode (±12V rail protection)
- **D3:** 6.8V Zener diode (5V rail protection)  
- **D4:** 4.3V Zener diode (3.3V rail protection)
- **D5:** 1.5V Zener diode (1V rail protection)
- **Package:** SOD-123 or DO-214AC (SMA)
- **Rating:** 1W minimum for power rail protection

---

### U2: TPS54531DDAR (12V → 5V Switching)
**Function:** High-efficiency buck converter for Pi + Display  
**Package:** SO-8 PowerPAD  
**Output:** 5V @ 5A  

**Required Components:**
- **C6:** 47µF, 25V (VIN input bulk, low ESR)
- **C7:** 10µF, 25V (VIN medium frequency)
- **C8:** 0.1µF, 50V (VIN high frequency)
- **C9:** 220µF, 10V (VOUT output bulk, low ESR)
- **C10:** 22µF, 10V (VOUT medium frequency) 
- **C11:** 0.1µF, 10V (VOUT high frequency)
- **L1:** 47µH power inductor (Würth 744777247 or similar)
- **D1:** 5A Schottky diode (MBRS540T3G)
- **R2:** 10.2kΩ (feedback upper resistor)
- **R3:** 1.96kΩ (feedback lower resistor)
- **R4:** 100kΩ (EN pull-up, optional)
- **C12:** 100nF (soft-start capacitor)

---

### U3: LT3045MPMS8E-PBF (12V → 3.3V Linear)
**Function:** Ultra-low noise linear regulator for precision analog  
**Package:** MSOP-8  
**Output:** 3.3V @ 500mA  

**Required Bypass Capacitors:**
- **C13:** 100µF, 25V (VIN input bulk, tantalum preferred)
- **C14:** 10µF, 25V (VIN medium frequency)
- **C15:** 1µF, 25V (VIN high frequency, X7R)
- **C16:** 0.1µF, 25V (VIN very high frequency, X7R)
- **C17:** 100µF, 10V (VOUT output bulk, low ESR tantalum)
- **C18:** 22µF, 10V (VOUT medium frequency, X7R)
- **C19:** 4.7µF, 10V (VOUT high frequency, X7R)
- **C20:** 0.1µF, 10V (VOUT very high frequency, X7R)
- **C21:** 0.01µF, 10V (VOUT ultra high frequency, C0G)
- **R5:** 49.9kΩ (SET pin resistor for 3.3V output)

---

### U4: TPS7A0230PDBVR (3.3V → 1V Linear)
**Function:** Precision linear regulator for gain circuit reference  
**Package:** SOT-23-5  
**Output:** 1V @ 200mA  

**Required Bypass Capacitors:**
- **C22:** 22µF, 10V (VIN input bulk, X7R)
- **C23:** 4.7µF, 10V (VIN medium frequency, X7R)
- **C24:** 0.1µF, 10V (VIN high frequency, X7R)
- **C25:** 47µF, 10V (VOUT output bulk, low ESR)
- **C26:** 10µF, 10V (VOUT medium frequency, X7R)
- **C27:** 1µF, 10V (VOUT high frequency, X7R)
- **C28:** 0.1µF, 10V (VOUT very high frequency, X7R)
- **R6:** 124kΩ (FB pin resistor for 1V output)
- **R7:** 49.9kΩ (FB pin resistor for 1V output)

---

## 🔗 SYSTEM-LEVEL COMPONENTS

### R1: 0Ω Resistor (AGND ↔ DGND Connection)
**Function:** Single-point ground connection for star grounding  
**Package:** 0603 or 0805  
**Rating:** 1A minimum current capability  
**Alternative:** Ferrite bead for additional isolation if needed

---

## 📋 BATTERY INPUT FILTERING

### Input Power Filtering (12V_BATT):
- **C29:** 3300µF, 25V (Primary bulk storage, electrolytic)
- **C30:** 470µF, 25V (Secondary bulk, low ESR)
- **C31:** 47µF, 25V (Medium frequency filtering)
- **C32:** 4.7µF, 25V (Higher frequency filtering)
- **C33:** 0.1µF, 50V (High frequency noise, X7R)

---

## 🔧 FILTERED +12V OUTPUT

### Clean +12V Rail (for op-amps):
- **L2:** 10µH ferrite bead or small inductor
- **C34:** 470µF, 25V (Bulk filtering)
- **C35:** 100µF, 25V (Medium frequency)
- **C36:** 10µF, 25V (Higher frequency)
- **C37:** 0.1µF, 25V (High frequency, X7R)

---

## 📊 COMPONENT SUMMARY

| Component Type | Quantity | Notes |
|---------------|----------|-------|
| **Voltage Regulator ICs** | 4 | ICL7660, TPS54531, LT3045, TPS7A0230 |
| **Protection Components** | 5 | 1 fuse + 4 zener diodes |
| **Inductors** | 2 | Power inductor + filter inductor |
| **Diodes** | 1 | Schottky for switching regulator |
| **Resistors** | 7 | Feedback, pullup, star ground connection |
| **Capacitors** | 37 | Progressive filtering strategy |

---

## 🎯 POWER FLAGS LOCATIONS

**Add Power Flags to these nets:**
- **+12V** (filtered output)
- **-12V** (inverter output)  
- **+5V** (switching regulator output)
- **3.3V** (linear regulator output)
- **1V** (precision linear output)
- **AGND** (analog ground)
- **DGND** (digital ground)

**Do NOT add power flags to:**
- **+12V_BATT** (inherits from root schematic)
- **GND_BATT** (inherits from root schematic)

---

## 🏗️ IMPLEMENTATION ORDER

1. **Place fuse (F1)** immediately after +12V_BATT hierarchical label
2. **Place all 4 regulator ICs** 
3. **Add hierarchical labels** for all power rails
4. **Place power rail protection zeners** (D2-D5) on each output rail
5. **Place bypass capacitors** near each IC (closest first: 0.1µF, then larger values)
6. **Add power components** (inductor, diode for TPS54531)
7. **Place feedback resistors** for each regulator
8. **Add input filtering network**
9. **Place R1 (0Ω resistor)** for star ground connection
10. **Add power flags** to all output rails
11. **Connect nets** and verify electrical rules

**Remember:** Keep switching regulator (U2) physically separated from linear regulators for noise isolation!