import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SnakeGame from '@/components/games/SnakeGame';
import TetrisGame from '@/components/games/TetrisGame';
import Game2048 from '@/components/games/Game2048';
import PongGame from '@/components/games/PongGame';
import Leaderboard from '@/components/Leaderboard';

type Game = {
  id: string;
  name: string;
  category: string;
  icon: string;
  popular: boolean;
  new: boolean;
  component?: React.ComponentType;
};

const games: Game[] = [
  { id: 'snake', name: 'Змейка', category: 'Классика', icon: '🐍', popular: true, new: false, component: SnakeGame },
  { id: 'tetris', name: 'Тетрис', category: 'Классика', icon: '🧱', popular: true, new: false, component: TetrisGame },
  { id: '2048', name: '2048', category: 'Головоломки', icon: '🔢', popular: true, new: false, component: Game2048 },
  { id: 'pong', name: 'Пинг-понг', category: 'Аркады', icon: '🏓', popular: false, new: true, component: PongGame },
  { id: 'breakout', name: 'Арканоид', category: 'Аркады', icon: '⚾', popular: true, new: false },
  { id: 'pacman', name: 'Пакман', category: 'Классика', icon: '👾', popular: true, new: false },
  { id: 'space', name: 'Космический бой', category: 'Экшн', icon: '🚀', popular: true, new: false },
  { id: 'racing', name: 'Гонки', category: 'Экшн', icon: '🏎️', popular: false, new: true },
  { id: 'chess', name: 'Шахматы', category: 'Головоломки', icon: '♟️', popular: true, new: false },
  { id: 'checkers', name: 'Шашки', category: 'Головоломки', icon: '⚫', popular: false, new: false },
  { id: 'sudoku', name: 'Судоку', category: 'Головоломки', icon: '🔢', popular: true, new: false },
  { id: 'minesweeper', name: 'Сапёр', category: 'Головоломки', icon: '💣', popular: false, new: false },
  { id: 'match3', name: 'Три в ряд', category: 'Головоломки', icon: '💎', popular: true, new: false },
  { id: 'bubble', name: 'Пузыри', category: 'Аркады', icon: '🫧', popular: false, new: false },
  { id: 'mahjong', name: 'Маджонг', category: 'Головоломки', icon: '🀄', popular: false, new: false },
  { id: 'solitaire', name: 'Пасьянс', category: 'Карточные', icon: '🃏', popular: true, new: false },
  { id: 'poker', name: 'Покер', category: 'Карточные', icon: '🎰', popular: false, new: false },
  { id: 'blackjack', name: 'Блэкджек', category: 'Карточные', icon: '🎴', popular: false, new: false },
  { id: 'memory', name: 'Память', category: 'Головоломки', icon: '🧠', popular: false, new: true },
  { id: 'quiz', name: 'Викторина', category: 'Головоломки', icon: '❓', popular: false, new: false },
  { id: 'words', name: 'Слова', category: 'Головоломки', icon: '📝', popular: false, new: false },
  { id: 'crossword', name: 'Кроссворд', category: 'Головоломки', icon: '📰', popular: false, new: false },
  { id: 'platformer', name: 'Платформер', category: 'Экшн', icon: '🦘', popular: true, new: false },
  { id: 'runner', name: 'Раннер', category: 'Экшн', icon: '🏃', popular: true, new: true },
  { id: 'tower', name: 'Защита башни', category: 'Стратегия', icon: '🏰', popular: false, new: false },
  { id: 'rpg', name: 'RPG', category: 'Стратегия', icon: '⚔️', popular: false, new: false },
  { id: 'farm', name: 'Ферма', category: 'Симулятор', icon: '🌾', popular: false, new: false },
  { id: 'cooking', name: 'Готовка', category: 'Симулятор', icon: '👨‍🍳', popular: false, new: false },
  { id: 'fishing', name: 'Рыбалка', category: 'Симулятор', icon: '🎣', popular: false, new: false },
  { id: 'pool', name: 'Бильярд', category: 'Спорт', icon: '🎱', popular: false, new: false },
  { id: 'bowling', name: 'Боулинг', category: 'Спорт', icon: '🎳', popular: false, new: false },
  { id: 'golf', name: 'Гольф', category: 'Спорт', icon: '⛳', popular: false, new: false },
  { id: 'basketball', name: 'Баскетбол', category: 'Спорт', icon: '🏀', popular: false, new: false },
  { id: 'football', name: 'Футбол', category: 'Спорт', icon: '⚽', popular: true, new: false },
  { id: 'hockey', name: 'Хоккей', category: 'Спорт', icon: '🏒', popular: false, new: false },
  { id: 'tennis', name: 'Теннис', category: 'Спорт', icon: '🎾', popular: false, new: false },
  { id: 'darts', name: 'Дартс', category: 'Спорт', icon: '🎯', popular: false, new: false },
  { id: 'pinball', name: 'Пинбол', category: 'Аркады', icon: '🕹️', popular: false, new: false },
  { id: 'flappy', name: 'Flappy Bird', category: 'Аркады', icon: '🐦', popular: true, new: false },
  { id: 'helicopter', name: 'Вертолёт', category: 'Аркады', icon: '🚁', popular: false, new: false },
  { id: 'parkour', name: 'Паркур', category: 'Экшн', icon: '🤸', popular: false, new: true },
  { id: 'ninja', name: 'Ниндзя', category: 'Экшн', icon: '🥷', popular: false, new: false },
  { id: 'zombie', name: 'Зомби', category: 'Экшн', icon: '🧟', popular: true, new: false },
  { id: 'shooter', name: 'Шутер', category: 'Экшн', icon: '🔫', popular: false, new: false },
  { id: 'tank', name: 'Танки', category: 'Экшн', icon: '🛡️', popular: false, new: false },
  { id: 'war', name: 'Война', category: 'Стратегия', icon: '💥', popular: false, new: false },
  { id: 'city', name: 'Город', category: 'Симулятор', icon: '🏙️', popular: false, new: false },
  { id: 'tycoon', name: 'Магнат', category: 'Симулятор', icon: '💰', popular: false, new: false },
  { id: 'puzzle', name: 'Пазлы', category: 'Головоломки', icon: '🧩', popular: false, new: false },
  { id: 'coloring', name: 'Раскраски', category: 'Творчество', icon: '🎨', popular: false, new: false },
  { id: 'music', name: 'Музыка', category: 'Творчество', icon: '🎵', popular: false, new: true },
  { id: 'dress', name: 'Одевалка', category: 'Творчество', icon: '👗', popular: false, new: false },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');

  const categories = ['Все', 'Классика', 'Головоломки', 'Аркады', 'Экшн', 'Стратегия', 'Симулятор', 'Спорт', 'Карточные', 'Творчество'];

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularGames = games.filter(g => g.popular);
  const newGames = games.filter(g => g.new);

  const renderGameCard = (game: Game) => (
    <Card
      key={game.id}
      className="relative overflow-hidden group cursor-pointer transition-all hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-card to-card/50 border-2 border-primary/20 hover:border-primary/60"
      onClick={() => setSelectedGame(game)}
    >
      <div className="p-6 text-center">
        <div className="text-6xl mb-3">{game.icon}</div>
        <h3 className="font-bold text-lg mb-2">{game.name}</h3>
        <Badge variant="secondary" className="text-xs">{game.category}</Badge>
        {game.new && (
          <Badge className="absolute top-2 right-2 bg-accent animate-pulse-glow">
            NEW
          </Badge>
        )}
        {game.popular && (
          <div className="absolute top-2 left-2">
            <Icon name="TrendingUp" size={20} className="text-secondary" />
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );

  if (selectedGame) {
    const GameComponent = selectedGame.component;
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <Button
            onClick={() => setSelectedGame(null)}
            variant="outline"
            className="mb-4"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад к играм
          </Button>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-6xl">{selectedGame.icon}</div>
            <div>
              <h1 className="text-4xl font-bold">{selectedGame.name}</h1>
              <Badge variant="secondary">{selectedGame.category}</Badge>
            </div>
          </div>
          {GameComponent ? (
            <GameComponent />
          ) : (
            <Card className="p-12 text-center">
              <Icon name="GamepadIcon" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Игра в разработке</h2>
              <p className="text-muted-foreground">Эта игра скоро будет доступна!</p>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🎮</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  GameHub
                </h1>
                <p className="text-sm text-muted-foreground">50+ игр онлайн</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Icon name="User" size={18} className="mr-2" />
                Профиль
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px] mx-auto">
            <TabsTrigger value="home">
              <Icon name="Home" size={18} className="mr-2" />
              Главная
            </TabsTrigger>
            <TabsTrigger value="catalog">
              <Icon name="Grid3x3" size={18} className="mr-2" />
              Каталог
            </TabsTrigger>
            <TabsTrigger value="popular">
              <Icon name="TrendingUp" size={18} className="mr-2" />
              Популярные
            </TabsTrigger>
            <TabsTrigger value="new">
              <Icon name="Sparkles" size={18} className="mr-2" />
              Новые
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Icon name="Trophy" size={18} className="mr-2" />
              Рейтинг
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-8 animate-fade-in">
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent p-12 text-center text-white">
              <div className="relative z-10">
                <h2 className="text-5xl font-bold mb-4">Добро пожаловать в GameHub!</h2>
                <p className="text-xl mb-6 opacity-90">Играй в более 50 игр прямо в браузере</p>
                <Button size="lg" variant="secondary" onClick={() => setActiveTab('catalog')}>
                  <Icon name="Gamepad2" size={20} className="mr-2" />
                  Начать играть
                </Button>
              </div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Icon name="TrendingUp" size={32} className="text-primary" />
                Популярные игры
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {popularGames.slice(0, 6).map(renderGameCard)}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Icon name="Sparkles" size={32} className="text-accent" />
                Новые игры
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {newGames.map(renderGameCard)}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск игр..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="whitespace-nowrap"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredGames.map(renderGameCard)}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-6">Популярные игры</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {popularGames.map(renderGameCard)}
            </div>
          </TabsContent>

          <TabsContent value="new" className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-6">Новые игры</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {newGames.map(renderGameCard)}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="animate-fade-in">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
