# CHIP-8 Emulator 帮助

## 模拟器介绍

这是个上个世纪的古老游戏机的模拟器，因为简单所以拿来当做虚拟机作业。想看看那时候的游戏是什么样子吗？考古也蛮有意思的:)

在rom文件夹下有chip8和super chip的rom文件。大部分的rom文件会有一个对应的txt文件说明。

CHIP-8 在1970年被提出，之后有许多人对其进行扩展，流传最广的是 Super CHIP-8，把分辨率从32\*64增加到64\*128，并支持滚屏，向下兼容。这个模拟器同样支持 Super CHIP-8 ROM。后者的可玩性相对高一些。

先加载ROM，再开始游戏，支持暂停与回复，复位按钮可以从头开始（再点一下开始游戏）。浅绿色条可以调整游戏速度，对于SuperChip游戏建议开启2x速度。

## 按键

CHIP-8原机器的输入设备是一块16位按键板，键位是这个样子——

<center>
<table>
<tr>
<td>1</td>
<td>2</td>
<td>3</td>
<td>C</td>
</tr>
<tr>
<td>4</td>
<td>5</td>
<td>6</td>
<td>D</td>
</tr>
<tr>
<td>7</td>
<td>8</td>
<td>9</td>
<td>E</td>
</tr>
<tr>
<td>A</td>
<td>0</td>
<td>B</td>
<td>F</td>
</tr>
</table>
</center>

把它映射到现在的键盘上，对应于：

<center>
<table>
<tr>
<td>1</td>
<td>2</td>
<td>3</td>
<td>4</td>
</tr>
<tr>
<td>Q</td>
<td>W</td>
<td>E</td>
<td>R</td>
</tr>
<tr>
<td>A</td>
<td>S</td>
<td>D</td>
<td>F</td>
</tr>
<tr>
<td>Z</td>
<td>X</td>
<td>C</td>
<td>V</td>
</tr>
</table>
</center>

Generally, 有这样几种操作逻辑：

<center>
<table>
<tr>
<td>.</td>
<td>.</td>
<td>↑</td>
<td>.</td>
</tr>
<tr>
<td>.</td>
<td>.</td>
<td>↓</td>
<td>.</td>
</tr>
<tr>
<td>←</td>
<td>→</td>
<td>.</td>
<td>.</td>
</tr>
<tr>
<td>.</td>
<td>.</td>
<td>.</td>
<td>.</td>
</tr>
</table>
</center>

---

<center>
<table>
<tr>
<td>.</td>
<td>↑</td>
<td>.</td>
<td>.</td>
</tr>
<tr>
<td>←</td>
<td>o</td>
<td>→</td>
<td>.</td>
</tr>
<tr>
<td>.</td>
<td>↓</td>
<td>.</td>
<td>.</td>
</tr>
<tr>
<td>.</td>
<td>.</td>
<td>.</td>
<td>.</td>
</tr>
</table>
</center>

---

对双人游戏，

<center>
<table>
<tr>
<td>↑</td>
<td>.</td>
<td>.</td>
<td>↑</td>
</tr>
<tr>
<td>↓</td>
<td>.</td>
<td>.</td>
<td>↓</td>
</tr>
<tr>
<td>.</td>
<td>.</td>
<td>.</td>
<td>.</td>
</tr>
<tr>
<td>.</td>
<td>.</td>
<td>.</td>
<td>.</td>
</tr>
</table>
</center>

有些比较明显的格子会直接按位置来，比如15 PUZZLE和井字棋Tic-Tac-Toe。

还是有很多游戏不遵循以上规则的，看一下rom旁边有没有说明文件，没有的话就摸索一下吧。

## 调试工具

调试工具会显示所有寄存器、PC等数值，下方是内存（双字节指令，有反汇编显示）与堆栈，再下面是当前PC指向的指令（在PC指向奇数地址时读这个）。几个控制按钮顾名思义。

PS：有几个游戏有BUG。。我不觉得是我的错。。或许是ROM不兼容吧

有问题 / 反馈请联系QQ 963366202。

## 翻译（未完成也不准备完成）

比较好玩的会在名字前标⭐。。

### __CHIP-8 ROMs__

#### ⭐ 15 PUZZLE

一个谜题，每次可把空格周围的数字往空格移动，按4*4键盘区对应的按键即可。

初始状态：

```text
1   2   3   4
5   6   7　 8
9   10  11  12
13  14  15
```

最终状态：

```text
15  14  13  12
11  10  9   8
7   6   5   4
3   2   1
```

#### BLINKY

吃豆人。 AS左右，3E上下。 在SuperChip的ROM里有一个“高清”版本。

#### BLITZ

emmmmmm飞机炸大楼？飞机每次会下降一点，撞到楼就算输。按W键投弹。

#### ⭐ BRIX

打砖块，QE左右移动。

#### CONNECT4

这是个双人游戏，QE左右，W键放置棋子，轮流。先连成4个的获胜（斜着也行）。__没有胜利检测__。

#### GUESS

想象一个1到63之间的数，如果屏幕上有那个数，按W（否则按其他键），最后电脑会猜出是哪个数。

#### ⭐ HIDDEN

4*4矩阵的卡片配对记忆游戏。2SQE上下左右，W键翻开卡片。

#### ⭐ INVADERS

大名鼎鼎的太空入侵者233333

QE左右移动，W射击。

#### KALEID

没搞清楚怎么玩，貌似是个佛性艺术游戏……

#### MAZE

随机生成一个迷宫……好看吧

#### ⭐ MERLIN

记忆光点出现的顺序，之后按照顺序按下对应的按键。对应按键为：QWAS。

#### MISSILE

按S键射击，打出去的子弹越多，你的移动速度越快，最多12发。

#### ⭐ PONG 2

PONG的改进版，玩家1使用1Q，玩家2使用4R。

#### TANK

QE左右，S2上下（不知为何反过来了），W发射子弹。

这个像素坦克好经典……想到了坦克大战。

#### ⭐ TETRIS

俄罗斯方块。WE左右，Q换姿势。

#### TICTAC

双人井字棋！键盘左上角3*3对应棋盘上的位置。

#### UFO

QWE往三个方向发射导弹射击UFO！

#### VBRIX

竖版打砖块，1Q上下移动，貌似有bug（不怪我我只是个写模拟器的）。

#### VERS

按键有点反人类……哪位同学知道这游戏啥意思请告诉我orz

#### WIPEOFF

还是打砖块。QE移动。

### __Super CHIP-8 ROMs__

#### Alien [Jonas Lindstedt, 1993]

太空入侵者。34左右，Z发射子弹。

#### ⭐ Blinky [Hans Christian Egeberg, 1991]

高清吃豆人。AS左右，3E上下。

#### ⭐ Car [Klaus von Sengbusch, 1994]

赛车游戏。AS左右。

#### Field! [Al Roland, 1993]

AS：右/左。4R：上/下。X：开始游戏。
