# Power Regulation Sheet Architecture

## Circuit Block Diagram - HYBRID NOISE-OPTIMIZED DESIGN

```
+12V_BATT ──┬── [Isolated Switching] ──── +5V (4A)
            │   (Pi + Display ONLY)       (Physically isolated)
            │   [Heavy filtering]
            │
            ├── [Bulk Caps] ──┬── [Filter] ──────── +12V (100mA)
            │                 │   (Op-amps)
            │                 │
            │                 ├── U3: 12V→3.3V ──┬── 3.3V (220mA)
            │                 │   (Ultra-low      │   (ADC, GPS)
            │                 │    noise linear)  │
            │                 │                   └── U4: 3.3V→1V ── 1V (100mA)
            │                 │                       (Gain circuit)
            │                 │
            │                 └── U1: 12V→-12V ────── -12V (100mA)
            │                     (Low-noise inverter)
            │
GND_BATT ───┴── [Star Ground] ──┬── AGND (Analog Ground)
                                └── DGND (Digital Ground)

Isolation Barrier: ═══════════════════════════════════════
(Magnetic/Optical coupling for Pi communication)
```

## DESIGN PHILOSOPHY: NOISE ISOLATION + THERMAL MANAGEMENT

**High-Power Digital Domain (Isolated):**
- **Switching regulator** for Pi+Display (4A @ 5V)
- **Physical isolation** from analog circuits  
- **Heavy filtering** and shielding
- **Separate ground plane** or chassis ground

**Precision Analog Domain (Linear Daisy-Chain):**
- **12V → 3.3V Linear** (ultra-low noise for ADC/GPS)
- **3.3V → 1V Linear** (precision for gain circuit)  
- **12V → -12V** (op-amp negative supply)
- **Pure linear regulation** - zero switching noise
- **Progressive PSRR filtering** through cascade

## Component Specifications

### High-Power Switching (Isolated):
- **U2 (12V→5V):** Isolated switching regulator
  - **Options:** Isolated DC-DC module, or non-isolated with heavy filtering
  - **4A output capability**
  - **Physically separated** from analog section by 2+ inches
  - **Surrounded by guard traces** and shielding

### Ultra-Low Noise Linear Chain:
- **U3 (12V→3.3V):** Premium LDO  
  - **TPS7A4700 (1A, <4µVrms noise)**
  - **LT3045 (500mA, <0.8µVrms noise)** ← Best choice
  - **For ADC and GPS precision circuits**

- **U4 (3.3V→1V):** Precision LDO
  - **TPS7A0230 (200mA, ultra-low noise)**
  - **LT3080 (1.1A, programmable)**
  - **Fed from ultra-clean 3.3V rail**

- **U1 (12V→-12V):** Linear Inverter
  - **ICL7660 with extra filtering**
  - **Or custom transformer-based linear inverter**

### Bypass Capacitor Strategy (HYBRID TOPOLOGY):

#### Input (Battery):
- **C1:** 3300µF, 25V (Bulk energy for switching + linear)
- **C2:** 470µF, 25V (Medium frequency)
- **C3:** 47µF, 25V (Higher frequency)
- **C4:** 0.1µF, 50V (High frequency)

#### Switching 5V Rail (Pi + Display):
- **C5:** 1000µF, 10V (Output bulk for switching regulator)
- **C6:** 100µF, 10V (ESR control)
- **C7:** 10µF, 10V (Medium freq)
- **C8:** 0.1µF, 10V (High freq)
- **L1:** Ferrite bead/inductor for isolation from analog

#### Ultra-Clean 3.3V Rail (Linear from 12V):
- **C9:** 220µF, 10V (Bulk - low ESR tantalum)
- **C10:** 47µF, 10V (Medium)
- **C11:** 10µF, 10V (X7R ceramic)
- **C12:** 1µF, 10V (X7R ceramic)  
- **C13:** 0.1µF, 10V (X7R ceramic)
- **C14:** 0.01µF, 10V (C0G ceramic for HF)

#### Precision 1V Rail (Linear from 3.3V):
- **C15:** 100µF, 10V (Bulk - ultra-low ESR)
- **C16:** 47µF, 10V (Medium)
- **C17:** 10µF, 10V (High freq)
- **C18:** 1µF, 10V (Very high freq)
- **C19:** 0.1µF, 10V (Ultra high freq)

#### -12V Rail:
- **C20:** 220µF, 25V (Bulk)
- **C21:** 47µF, 25V (Medium)
- **C22:** 0.1µF, 25V (High freq)

#### Filtered +12V:
- **C23:** 470µF, 25V (Bulk)
- **C24:** 100µF, 25V (Medium)
- **C25:** 10µF, 25V (Higher freq)
- **C26:** 0.1µF, 25V (High freq)

**Critical:** Progressive filtering through daisy-chain provides superior noise performance

## Ground Strategy

### Star Ground Implementation:
```
AGND ←──┬── Analog circuits (op-amps, ADC analog supply)
        │
        ├── [0Ω Resistor - SYSTEM LEVEL CONNECTION]
        │   (Single point connection for entire system)
        │
DGND ←──┴── Digital circuits (Pi, GPS, ADC digital supply)
```

**Note:** The 0Ω resistor connecting AGND/DGND is placed in the power regulation sheet as it's a system-level ground strategy decision.

### Test Points:
- **TP1:** +12V_BATT
- **TP2:** GND_BATT  
- **TP3:** +12V
- **TP4:** -12V
- **TP5:** +5V
- **TP6:** +3.3V
- **TP7:** AGND
- **TP8:** DGND

## Power Flags Location:
- **Root schematic:** Battery input terminals
- **Power regulation sheet:** All regulated output labels
- **Power consumption and heat estimates:**
  
  **Switching Regulator (Isolated):**
  - Input: 4A × 5V = 20W output
  - Efficiency: ~85%
  - Input power: 23.5W from 12V (1.96A)
  - **Heat: Only ~3.5W** (vs 26W linear!)
  
  **Linear Analog Chain:**
  - 12V→3.3V: (12-3.3) × 0.22A = **1.9W**
  - 3.3V→1V: (3.3-1) × 0.1A = **0.23W**
  - 12V→-12V: ~**0.5W**
  - **Total analog heat: 2.6W** (very manageable)
  
  **System Total:**
  - **Pi Domain: 1.96A @ 12V (switching)**
  - **Analog Domain: 0.3A @ 12V (linear)**
  - **Total Battery: 2.26A @ 12V**
  - **Total Heat: 6.1W** (vs 28W all-linear!)

## Interface with Other Hierarchical Sheets

**Power Regulation Sheet Provides:**
- **+12V** → Op-amps, analog switches (ultra-clean)
- **-12V** → Op-amps negative supply  
- **3.3V** → ADC, GPS (ultra-low noise linear from 12V)
- **1V** → Automatic gain circuit (precision, from 3.3V cascade)
- **+5V** → Pi, Display (isolated switching regulator)
- **AGND** → Analog ground (star point)
- **DGND** → Digital ground (star point)

**Hierarchical Sheet Interfaces:**

**Gain Control Sheets (X/Y/Z):**
- Receive: +12V, -12V, 3.3V, **1V**, AGND, DGND
- **1V used for precision reference/bias** in gain stages
- **Fed from daisy-chain for maximum noise rejection**

**MAX11040 Sheet:**
- Receive: **3.3V** (ultra-clean from 12V linear), AGND, DGND
- 3.3V → AVDD (direct from ultra-low noise rail)
- 3.3V → [Ferrite Bead] → DVDD (additional filtering)

**Pi Communication:**
- **5V** → Pi, Display (isolated switching rail)
- **DGND** → Pi ground (through isolation barrier)
- **Optical/Magnetic isolation** for communication with analog domain

**GPS Sheet:**
- Receive: **3.3V** (from ultra-clean linear rail), AGND, DGND
- Benefits from daisy-chain noise filtering

## Noise Performance Advantages

**Daisy-Chain Linear Benefits:**
```
12V Battery Noise → [12V→3.3V LDO: -60dB PSRR] → [3.3V→1V LDO: -80dB PSRR] → 1V
                                                                              
Total PSRR: ~140dB noise rejection to 1V rail!
```

**Isolation Strategy:**
- **Switching regulator**: Physically isolated, separate ground area
- **Linear cascade**: Progressive noise filtering  
- **Analog circuits**: See only ultra-clean linear supplies
- **Ground separation**: AGND ↔ DGND via 0Ω resistor at star point

**PCB Layout Critical Points:**
- **Switching regulator area**: Isolated by ≥2 inches + guard traces
- **Linear regulator cascade**: Close to analog circuits
- **Star ground**: Located at power regulation area
- **Pi communication**: Isolated via optocouplers/magnetic coupling

## Thermal Management

**Switching Regulator (5V):**
- **Only 3.5W heat** (vs 26W linear)
- Standard heat sink sufficient
- Isolated from precision analog area

**Linear Cascade:**
- **12V→3.3V: 1.9W** (standard TO-220 package OK)
- **3.3V→1V: 0.23W** (SOT-23 package sufficient)
- **Very manageable heat levels**

**Result: Professional precision instrument performance with single battery supply!**