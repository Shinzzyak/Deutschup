import { Link } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 text-center px-4">
      <div className="text-8xl font-black text-muted-foreground/20">404</div>
      <h1 className="text-3xl font-bold text-foreground">Halaman Tidak Ditemukan</h1>
      <p className="text-muted-foreground max-w-md">
        Sepertinya halaman yang kamu cari sudah dipindahkan atau tidak tersedia.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline" className="">
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
        </Button>
        <Button variant="outline" className="" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </div>
    </div>
  );
}
