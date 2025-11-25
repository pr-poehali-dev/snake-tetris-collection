import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type LeaderboardEntry = {
  rank: number;
  player: string;
  game: string;
  score: number;
  date: string;
};

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, player: 'ProGamer2024', game: 'Змейка', score: 2850, date: '23.11.2025' },
  { rank: 2, player: 'SnakeKiller', game: 'Змейка', score: 2640, date: '22.11.2025' },
  { rank: 3, player: 'TetrisMaster', game: 'Тетрис', score: 15800, date: '24.11.2025' },
  { rank: 4, player: 'BlockBuster', game: 'Тетрис', score: 14200, date: '21.11.2025' },
  { rank: 5, player: 'Number2048', game: '2048', score: 32768, date: '25.11.2025' },
  { rank: 6, player: 'PuzzleKing', game: '2048', score: 16384, date: '20.11.2025' },
  { rank: 7, player: 'PongChampion', game: 'Пинг-понг', score: 25, date: '24.11.2025' },
  { rank: 8, player: 'ArcadeHero', game: 'Змейка', score: 2380, date: '19.11.2025' },
  { rank: 9, player: 'RetroGamer', game: 'Тетрис', score: 13500, date: '23.11.2025' },
  { rank: 10, player: 'TopPlayer', game: '2048', score: 8192, date: '22.11.2025' },
  { rank: 11, player: 'SnakeExpert', game: 'Змейка', score: 2120, date: '18.11.2025' },
  { rank: 12, player: 'LineClearer', game: 'Тетрис', score: 12900, date: '21.11.2025' },
  { rank: 13, player: 'FastFingers', game: 'Пинг-понг', score: 22, date: '20.11.2025' },
  { rank: 14, player: 'MathGenius', game: '2048', score: 6400, date: '17.11.2025' },
  { rank: 15, player: 'GameMaster', game: 'Змейка', score: 1980, date: '19.11.2025' },
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Icon name="Trophy" size={24} className="text-yellow-500" />;
  if (rank === 2) return <Icon name="Medal" size={24} className="text-gray-400" />;
  if (rank === 3) return <Icon name="Award" size={24} className="text-orange-500" />;
  return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
};

const getGameIcon = (game: string) => {
  const icons: { [key: string]: string } = {
    'Змейка': '🐍',
    'Тетрис': '🧱',
    '2048': '🔢',
    'Пинг-понг': '🏓',
  };
  return icons[game] || '🎮';
};

const Leaderboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Icon name="Trophy" size={36} className="text-accent" />
            Таблица лидеров
          </h2>
          <p className="text-muted-foreground mt-2">Топ игроков всех времён</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((rank) => {
          const entry = leaderboardData.find(e => e.rank === rank);
          if (!entry) return null;

          return (
            <Card
              key={rank}
              className={`p-6 relative overflow-hidden ${
                rank === 1 ? 'border-2 border-primary animate-pulse-glow' : ''
              }`}
            >
              <div className="absolute top-2 right-2">
                {getRankIcon(rank)}
              </div>
              <div className="text-center mt-4">
                <div className="text-4xl mb-2">{getGameIcon(entry.game)}</div>
                <h3 className="font-bold text-xl mb-1">{entry.player}</h3>
                <Badge variant="secondary" className="mb-2">{entry.game}</Badge>
                <div className="text-3xl font-bold text-primary">{entry.score.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">{entry.date}</div>
              </div>
              {rank === 1 && (
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
              )}
            </Card>
          );
        })}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 text-center">Место</TableHead>
              <TableHead>Игрок</TableHead>
              <TableHead>Игра</TableHead>
              <TableHead className="text-right">Рекорд</TableHead>
              <TableHead className="text-right">Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((entry) => (
              <TableRow
                key={`${entry.rank}-${entry.player}`}
                className={`${
                  entry.rank <= 3 ? 'bg-primary/5 font-semibold' : ''
                } hover:bg-primary/10 transition-colors`}
              >
                <TableCell className="text-center">
                  {getRankIcon(entry.rank)}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Icon name="User" size={16} className="text-muted-foreground" />
                    {entry.player}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getGameIcon(entry.game)}</span>
                    {entry.game}
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {entry.score.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {entry.date}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex items-center gap-4">
          <Icon name="Info" size={32} className="text-primary" />
          <div>
            <h3 className="font-bold text-lg mb-1">Попади в таблицу лидеров!</h3>
            <p className="text-sm text-muted-foreground">
              Играй в игры, зарабатывай очки и соревнуйся с лучшими игроками. Твой рекорд может оказаться на первом месте!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Leaderboard;
