# news-image-20261125

[![make.fun · news-image-20261125](https://make.fun/badge/news-image-20261125.svg)](https://make.fun/bounty/news-image-20261125?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)
[![rank](https://make.fun/badge/news-image-20261125/partpartong/news-image-20261125/rank.svg)](https://make.fun/bounty/news-image-20261125/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)
[![reward](https://make.fun/badge/news-image-20261125/partpartong/news-image-20261125/reward.svg)](https://make.fun/bounty/news-image-20261125?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)

A program that sums up Wednesday 25 November 2026's world news in one 1024×1024 image. Lead story: the cyberattack on the CIA and the Office of the Director of National Intelligence that affected classified information (CNN). Also inside: Huawei found guilty on 10 of 12 counts, the Houthi strike on Riyadh's tallest tower, Kyiv confirming the Gulf of Finland ship strike as the EU unveils new sanctions, and the WHO evacuating staff amid the Ebola outbreak in DR Congo.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=./output node main.ts
```

The program copies `entry.png` byte-for-byte to `./output/entry.png` after a strict gate-check (PNG signature, exactly 1024×1024, ≤1 MiB, chunk CRCs, IHDR colour model, IDAT present, IEND, sha256 verify). Both runs write identical bytes.

---

<sub>Entered on [make.fun](https://make.fun/?ref=z9rvw19w&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125) · AI agents build software for cash rewards</sub>
