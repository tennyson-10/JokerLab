'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Calculator, ChevronRight, CircleHelp, GripVertical, Layers3, Plus, RotateCcw, Sparkles, Trash2, Zap } from 'lucide-react'
import jokerData from '@/data/balatro_jokers.json'

type Joker = (typeof jokerData.jokers)[number]
type Modifier = 'none' | 'Foil' | 'Holographic' | 'Polychrome'
type Suit = '♠' | '♥' | '♦' | '♣'

type PlayingCard = { id: number; rank: string; suit: Suit; enhancement: string; seal: string; edition: Modifier }

const modifiers: { label: string; value: Modifier; short: string }[] = [
  { label: 'Base', value: 'none', short: '' },
  { label: 'Foil', value: 'Foil', short: '+50 Chips' },
  { label: 'Holographic', value: 'Holographic', short: '+10 Mult' },
  { label: 'Polychrome', value: 'Polychrome', short: 'X1.5 Mult' },
]

const starterCards: PlayingCard[] = [
  { id: 1, rank: 'A', suit: '♠', enhancement: 'Bonus', seal: 'None', edition: 'none' },
  { id: 2, rank: 'K', suit: '♠', enhancement: 'None', seal: 'None', edition: 'none' },
  { id: 3, rank: 'Q', suit: '♠', enhancement: 'Steel', seal: 'None', edition: 'none' },
  { id: 4, rank: 'J', suit: '♠', enhancement: 'None', seal: 'None', edition: 'Foil' },
  { id: 5, rank: '10', suit: '♠', enhancement: 'Gold', seal: 'Red', edition: 'none' },
  { id: 6, rank: '9', suit: '♥', enhancement: 'None', seal: 'None', edition: 'none' },
  { id: 7, rank: '8', suit: '♦', enhancement: 'Lucky Card', seal: 'None', edition: 'Holographic' },
  { id: 8, rank: '7', suit: '♣', enhancement: 'Stone Card', seal: 'None', edition: 'Polychrome' },
]

function effectScore(joker: Joker, cards: PlayingCard[]) {
  const effect = joker.effect.toLowerCase()
  const hand = cards.map((card) => card.rank)
  const suits = cards.map((card) => card.suit)
  let value = 0
  const counts = hand.reduce<Record<string, number>>((all, rank) => ({ ...all, [rank]: (all[rank] || 0) + 1 }), {})
  if (effect.includes('diamond')) value = suits.filter((suit) => suit === '♦').length * 3
  else if (effect.includes('heart')) value = suits.filter((suit) => suit === '♥').length * 3
  else if (effect.includes('spade')) value = suits.filter((suit) => suit === '♠').length * 3
  else if (effect.includes('club')) value = suits.filter((suit) => suit === '♣').length * 3
  else if (effect.includes('pair')) value = Object.values(counts).filter((count) => count >= 2).length ? 8 : 0
  else if (effect.includes('three of a kind')) value = Object.values(counts).some((count) => count >= 3) ? 12 : 0
  else if (effect.includes('straight')) value = hand.length >= 5 ? 12 : 0
  else if (effect.includes('flush')) value = new Set(suits).size === 1 ? 10 : 0
  else {
    const match = joker.effect.match(/[+X](\d+)/)
    value = match ? Number(match[1]) : 0
  }
  return value
}

function App() {
  const jokers = jokerData.jokers
  const [selected, setSelected] = useState<{ joker: Joker; modifier: Modifier }[]>([
    { joker: jokers[5], modifier: 'Holographic' },
    { joker: jokers[8], modifier: 'none' },
    { joker: jokers[18], modifier: 'Foil' },
  ])
  const [cards, setCards] = useState(starterCards)
  const [playedCount, setPlayedCount] = useState(5)
  const [query, setQuery] = useState('')

  const optimized = useMemo(() => [...selected].sort((a, b) => {
    const aMult = a.joker.type_symbol.includes('Xm') ? 2 : 0
    const bMult = b.joker.type_symbol.includes('Xm') ? 2 : 0
    return aMult - bMult || effectScore(a.joker, cards) - effectScore(b.joker, cards)
  }), [selected, cards])
  
  const totals = useMemo(() => {
    const playedCards = cards.slice(0, playedCount)
    const heldCards = cards.slice(playedCount)
    
    let chips = playedCards.reduce((sum, card) => {
      if (card.enhancement === 'Stone Card') return sum + 50
      const baseRank = Number(card.rank === 'A' ? 11 : card.rank === 'K' || card.rank === 'Q' || card.rank === 'J' ? 10 : card.rank) || 0
      return sum + baseRank
    }, 0)
    
    let mult = 1
    selected.forEach(({ joker, modifier }) => {
      const bonus = effectScore(joker, cards)
      if (joker.type_symbol.includes('Xm')) mult *= Math.max(1, bonus || 1)
      else if (joker.type_symbol.includes('+m')) mult += bonus
      else chips += bonus
      if (modifier === 'Foil') chips += 50
      if (modifier === 'Holographic') mult += 10
      if (modifier === 'Polychrome') mult *= 1.5
    })
    
    playedCards.forEach((card) => {
      if (card.enhancement === 'Bonus') chips += 30
      if (card.enhancement === 'Lucky Card') { chips += Math.random() > 0.5 ? 20 : 0; mult += Math.random() > 0.5 ? 20 : 0 }
    })
    
    heldCards.forEach((card) => {
      if (card.enhancement === 'Steel') mult *= 1.5
      if (card.enhancement === 'Gold') chips += 3
      if (card.enhancement === 'Lucky Card') { chips += Math.random() > 0.5 ? 20 : 0; mult += Math.random() > 0.5 ? 20 : 0 }
    })
    
    // Card editions
    cards.forEach((card) => {
      if (card.edition === 'Foil') chips += 50
      if (card.edition === 'Holographic') mult += 10
      if (card.edition === 'Polychrome') mult *= 1.5
    })
    
    return { chips: Math.round(chips), mult: Math.round(mult * 10) / 10, score: Math.round(chips * mult) }
  }, [cards, playedCount, selected])
  
  const filtered = jokers.filter((joker) => joker.name.toLowerCase().includes(query.toLowerCase()))
  const addJoker = (joker: Joker) => { setSelected([...selected, { joker, modifier: 'none' }]) }
  const removeJoker = (index: number) => setSelected(selected.filter((_, itemIndex) => itemIndex !== index))
  const updateJoker = (index: number, patch: Partial<{ modifier: Modifier }>) => setSelected(selected.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))
  const updateCard = (id: number, patch: Partial<PlayingCard>) => setCards(cards.map((card) => card.id === id ? { ...card, ...patch } : card))

  return (
    <main className="min-h-screen text-[#f5f2ea]">
      <header className="border-b-4 border-[#8b0000] bg-gradient-to-r from-[#4a0000]/90 via-[#1a0f2e]/90 to-[#000066]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-4 lg:px-12">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded border-4 border-[#e9b949] bg-gradient-to-br from-[#8b0000] to-[#4a0000] text-[#e9b949] shadow-lg"><Zap /></div>
            <div>
              <p className="text-xl font-black tracking-wider">JOKERLAB</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#ff6b6b]">Balatro Scoring Laboratory</p>
            </div>
          </div>
          <button className="rounded border-2 border-[#e9b949] px-4 py-2 text-xs font-bold text-[#e9b949] hover:bg-[#e9b949]/10 transition-all shadow-lg" onClick={() => { setSelected([]); setCards(starterCards) }}><RotateCcw data-icon="inline-start" /> RESET</button>
        </div>
      </header>

      <div className="mx-auto max-w-[1800px] px-6 py-6 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <div className="rounded border-4 border-[#8b7355] bg-gradient-to-br from-[#2a1810]/95 to-[#1a0f0a]/95 p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black tracking-wider">JOKER ORDER</h2>
                <button onClick={() => addJoker(jokers[0])} className="rounded border-2 border-[#32cd32] px-3 py-1 text-xs font-bold text-[#32cd32] hover:bg-[#32cd32]/10 flex items-center gap-1"><Plus size={12} /> ADD JOKER</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {optimized.map(({ joker, modifier }, index) => (
                  <div key={`${joker.number}-${index}`} className="group relative rounded border-2 border-[#654321] bg-gradient-to-br from-[#3e2723] to-[#1b0000] p-2 shadow-xl hover:border-[#e9b949] transition-all" style={{ imageRendering: 'pixelated' }}>
                    <div className="flex items-center gap-2">
                      <span className="grid size-6 shrink-0 place-items-center rounded border border-[#e9b949] bg-[#8b0000] text-[10px] font-black text-[#e9b949]">{index + 1}</span>
                      <img src={joker.image.thumbnail_url} alt={joker.name} className="h-20 w-14 rounded border border-[#654321] object-cover shadow-lg" style={{ imageRendering: 'pixelated' }} />
                      <div className="min-w-0 w-24">
                        <p className="truncate text-[10px] font-black text-[#ffd700]">{joker.name.toUpperCase()}</p>
                        <select value={modifier} onChange={(event) => updateJoker(selected.findIndex((item) => item.joker.number === joker.number), { modifier: event.target.value as Modifier })} className="mt-1 w-full rounded border border-[#654321] bg-[#1a0f0a] px-1 py-0.5 text-[7px] text-[#e9b949] font-bold">
                          <option value="none">BASE</option>
                          <option value="Foil">FOIL</option>
                          <option value="Holographic">HOLO</option>
                          <option value="Polychrome">POLY</option>
                        </select>
                      </div>
                    </div>
                    <button aria-label={`Remove ${joker.name}`} onClick={() => removeJoker(selected.findIndex((item) => item.joker.number === joker.number))} className="absolute -right-1 -top-1 bg-[#8b0000] rounded-full w-5 h-5 flex items-center justify-center border border-[#ff6b6b]">
                      <Trash2 size={10} className="text-[#ff6b6b]" />
                    </button>
                  </div>
                ))}
                {optimized.length === 0 && (
                  <div className="flex items-center justify-center px-8 py-6 rounded border-2 border-dashed border-[#654321] bg-[#1a0f0a]/50 text-[#8b7355]">
                    <Plus size={24} />
                    <span className="text-xs font-bold ml-2">ADD JOKERS</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="rounded border-4 border-[#4a4a4a] bg-gradient-to-br from-[#1a1a2e]/95 to-[#0f0f23]/95 p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black tracking-wider">HAND SIMULATOR</h2>
                <select value={playedCount} onChange={(event) => setPlayedCount(Number(event.target.value))} className="rounded border-2 border-[#87ceeb] bg-[#0f0f23] px-3 py-2 text-xs font-bold text-[#87ceeb]">
                  <option value={1}>1 PLAYED</option>
                  <option value={2}>2 PLAYED</option>
                  <option value={3}>3 PLAYED</option>
                  <option value={4}>4 PLAYED</option>
                  <option value={5}>5 PLAYED</option>
                  <option value={6}>6 PLAYED</option>
                  <option value={7}>7 PLAYED</option>
                  <option value={8}>8 PLAYED</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {cards.map((card, index) => (
                  <div key={card.id} className={`w-[95px] rounded border-3 p-2 shadow-xl ${index < playedCount ? 'border-[#ff6b6b] bg-gradient-to-br from-[#f4f0e7] via-[#e6ddd4] to-[#d4c4b0] text-[#181b18]' : 'border-[#32cd32] bg-gradient-to-br from-[#1d4d2e] via-[#0f2f1a] to-[#0a1f0f] text-[#90ee90]'}`} style={{ imageRendering: 'pixelated' }}>
                    <div className="mb-1 flex items-center justify-between text-[12px] font-black">
                      <span>{card.rank}</span>
                      <span className={card.suit === '♥' || card.suit === '♦' ? 'text-[#dc143c]' : card.suit === '♠' ? 'text-[#000000]' : 'text-[#006400]'}>{card.suit}</span>
                    </div>
                    <div className={`grid h-18 place-items-center text-4xl font-black ${index < playedCount ? 'text-[#8b0000]' : 'text-[#90ee90]'}`}>{card.suit}</div>
                    <select value={card.enhancement} onChange={(event) => updateCard(card.id, { enhancement: event.target.value })} className={`w-full rounded border px-1 py-0.5 text-[7px] font-bold mt-1 ${index < playedCount ? 'border-black/20 bg-white/80 text-black' : 'border-white/20 bg-black/40 text-white'}`}>
                      <option>None</option>
                      <option>Bonus</option>
                      <option>Steel</option>
                      <option>Gold</option>
                      <option>Glass</option>
                      <option>Wild</option>
                      <option>Lucky Card</option>
                      <option>Stone Card</option>
                    </select>
                    <select value={card.edition} onChange={(event) => updateCard(card.id, { edition: event.target.value as Modifier })} className={`w-full rounded border px-1 py-0.5 text-[7px] font-bold mt-1 ${index < playedCount ? 'border-black/20 bg-white/80 text-black' : 'border-white/20 bg-black/40 text-white'}`}>
                      <option value="none">Base</option>
                      <option value="Foil">Foil</option>
                      <option value="Holographic">Holo</option>
                      <option value="Polychrome">Poly</option>
                    </select>
                    <select value={card.seal} onChange={(event) => updateCard(card.id, { seal: event.target.value })} className={`w-full rounded border px-1 py-0.5 text-[7px] font-bold mt-1 ${index < playedCount ? 'border-black/20 bg-white/80 text-black' : 'border-white/20 bg-black/40 text-white'}`}>
                      <option>None</option>
                      <option>Red</option>
                      <option>Blue</option>
                      <option>Gold</option>
                      <option>Purple</option>
                    </select>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px]">
                <span className="text-[#ff6b6b] font-bold">● PLAYED ({playedCount})</span>
                <span className="text-[#32cd32] font-bold">● HELD ({cards.length - playedCount})</span>
              </div>
            </div>
            <div className="mt-6 rounded border-4 border-[#4b0082] bg-gradient-to-br from-[#2d1b4e]/95 to-[#1a0f2e]/95 p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black tracking-wider">JOKER COLLECTION</h2>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="SEARCH..." className="w-40 rounded border-2 border-[#dda0dd] bg-[#1a0f2e] px-3 py-2 text-xs font-bold text-[#dda0dd] outline-none placeholder:text-[#8b7d8b]" />
              </div>
              <div className="grid gap-2 grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                {filtered.map((joker) => (
                  <button key={joker.number} onClick={() => addJoker(joker)} className="flex flex-col items-center gap-1 rounded border-2 border-[#654321] bg-gradient-to-br from-[#3e2723] to-[#1b0000] p-2 text-center transition hover:border-[#e9b949] shadow-lg" style={{ imageRendering: 'pixelated' }}>
                    <img src={joker.image.thumbnail_url} alt="" className="h-16 w-12 rounded border border-[#654321] object-cover" style={{ imageRendering: 'pixelated' }} />
                    <span className="block truncate w-full text-[8px] font-black text-[#ffd700]">{joker.name.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded border-2 border-[#654321] bg-gradient-to-br from-[#2a1810]/95 to-[#1a0f0a]/95 p-4">
              <h3 className="text-sm font-black mb-3 text-[#d2691e]">SCORING TRACE</h3>
              <div className="flex flex-wrap gap-2">
                {optimized.map(({ joker, modifier }, index) => (
                  <div key={`${joker.number}-trace`} className="flex items-center gap-2 rounded border border-[#654321] bg-[#1a0f0a] px-2 py-1">
                    <img src={joker.image.thumbnail_url} alt="" className="h-10 w-7 rounded border border-[#654321]" />
                    <div className="text-[8px]">
                      <p className="font-black text-[#ffd700]">{joker.name.toUpperCase()} {modifier !== 'none' && `[${modifier.toUpperCase()}]`}</p>
                      <p className="text-[#ffa500]">{effectScore(joker, cards) || '0'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside>
          <div className="overflow-hidden rounded border-6 border-[#e9b949] bg-gradient-to-br from-[#8b0000] to-[#4a0000] shadow-2xl">
            <div className="bg-gradient-to-r from-[#ffd700] to-[#e9b949] px-6 py-6 text-[#1a0f0a]">
              <div className="text-center mb-2">
                <span className="text-sm font-black uppercase tracking-[0.3em]">SCORE</span>
              </div>
              <p className="text-6xl font-black tracking-wider text-center">{totals.score.toLocaleString()}</p>
              <p className="mt-2 text-center text-xs font-black">{totals.chips.toLocaleString()} × {totals.mult}</p>
            </div>
            <div className="grid grid-cols-2 divide-x-2 divide-[#e9b949]/50 bg-[#1a0000]/80">
              <div className="p-3 text-center">
                <p className="text-[9px] uppercase tracking-widest text-[#f2ca6a]">CHIPS</p>
                <p className="mt-1 text-xl font-black text-[#fff]">{totals.chips}</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-[9px] uppercase tracking-widest text-[#f2ca6a]">MULT</p>
                <p className="mt-1 text-xl font-black text-[#fff]">{totals.mult}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default App
