import { Sparkles, Mail, Phone, MapPin, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t-2 border-primary/20 bg-gradient-to-b from-card to-[hsl(var(--pastel-pink)/0.3)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-primary/20 to-[hsl(var(--pastel-blue))]">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <span className="font-gaming text-xl font-bold text-gradient">TienCoTruong Shop</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              ✨ Shop bán acc Play Together uy tín. Giao dịch an toàn, hỗ trợ 24/7! 🎮
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-gaming font-semibold text-foreground flex items-center gap-2">
              🔗 Liên kết
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/accounts" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Danh sách acc
                </Link>
              </li>
              <li>
                <Link to="/guide" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Hướng dẫn mua
                </Link>
              </li>
              <li>
                <Link to="/warranty" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="font-gaming font-semibold text-foreground flex items-center gap-2">
              🌟 Dịch vụ
            </h4>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">Hỗ trợ đổi thông tin tài khoản</li>
              <li className="text-sm text-muted-foreground">Mua bán acc play together</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-gaming font-semibold text-foreground flex items-center gap-2">
              📞 Liên hệ
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                tien9a51011@gmail.com
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                0333 423 113
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Việt Nam
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t-2 border-primary/20 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Made with <Heart className="h-4 w-4 text-primary fill-primary animate-pulse" /> by TienCoTruong &copy; 2026
          </p>
        </div>
      </div>
    </footer>
  );
}