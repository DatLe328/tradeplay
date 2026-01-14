import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

import priceFilter1 from '@/assets/price-filter-1.jpg';
import priceFilter2 from '@/assets/price-filter-2.jpg';
import priceFilter3 from '@/assets/price-filter-3.jpg';
import priceFilter4 from '@/assets/price-filter-4.jpg';
import priceFilter5 from '@/assets/price-filter-5.jpg';
import { WelcomePopup } from '@/components/layout/WelcomePopup';

// const features = [
//   {
//     icon: Shield,
//     title: '🛡️ Uy tín hàng đầu',
//     description: 'Hơn 10,000+ giao dịch thành công, đánh giá 5 sao từ khách hàng yêu thương',
//   },
//   {
//     icon: Home,
//     title: '🏡 Acc có nhà đẹp',
//     description: 'Nhiều acc sở hữu nhà trang trí siêu cute, đầy đủ nội thất sang chảnh',
//   },
//   {
//     icon: Shirt,
//     title: '👗 Outfit đa dạng',
//     description: 'Acc với hàng trăm skin, outfit limited edition và vật phẩm hiếm',
//   },
// ];

// const stats = [
//   { value: '10K+', label: '💫 Giao dịch', emoji: '✨' },
//   { value: '5K+', label: '💕 Khách hàng', emoji: '🥰' },
//   { value: '99%', label: '😊 Hài lòng', emoji: '⭐' },
//   { value: '24/7', label: '💬 Hỗ trợ', emoji: '🎯' },
// ];

export default function HomePage() {

  return (
    <Layout>
      <WelcomePopup/>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient - Cute pastel */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--pastel-pink)/0.4)] via-background to-[hsl(var(--pastel-blue)/0.3)]" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-[hsl(var(--pastel-yellow)/0.4)] to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-[hsl(var(--pastel-green)/0.3)] to-transparent blur-3xl" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-[hsl(var(--pastel-blue))] border-2 border-primary/30">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-sm font-bold text-primary">✨ Shop acc Play Together uy tín ✨</span>
              </div>
              
              <h1 className="font-gaming text-4xl md:text-6xl lg:text-7xl font-bold">
                <span className="text-gradient">TienCoTruong</span>
                <br />
                <span className="text-foreground">Shop 🎮💖</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                🌟 Chuyên mua bán acc Play Together chất lượng cao! 
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/accounts">
                <Button className="btn-gaming text-lg px-8 py-6 gap-2">
                  🎮 Xem Acc Ngay
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" className="text-lg px-8 py-6 rounded-2xl border-2 border-primary/40 hover:bg-primary/10">
                  ✨ Đăng ký miễn phí
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-4 rounded-3xl bg-card border-2 border-primary/20 hover:border-primary/50 transition-all cute-shadow"
                >
                  <div className="font-gaming text-2xl md:text-3xl font-bold text-gradient">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* <section className="py-20 bg-gradient-to-b from-[hsl(var(--pastel-blue)/0.2)] to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-gaming text-3xl md:text-4xl font-bold mb-4">
              Tại sao chọn <span className="text-gradient">chúng mình</span>? 💕
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Shop cam kết mang đến trải nghiệm mua acc tốt nhất cho bạn! 🌈
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="p-6 rounded-3xl bg-card border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 cute-shadow"
              >
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-[hsl(var(--pastel-blue))] w-fit mb-4">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-gaming text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Price Filter Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-gaming text-3xl md:text-4xl font-bold mb-2">
              Tìm Acc theo <span className="text-gradient">Giá</span> 💰
            </h2>
            <p className="text-muted-foreground">
              Chọn khoảng giá phù hợp với túi tiền của bạn! 🎯
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Dưới 1 Triệu', range: '0-1000000', image: priceFilter1, color: 'from-green-400 to-emerald-500', desc: 'Acc giá rẻ cho newbie' },
              { label: '1 - 5 Triệu', range: '1000000-5000000', image: priceFilter2, color: 'from-blue-400 to-cyan-500', desc: 'Acc chất lượng tốt' },
              { label: '5 - 10 Triệu', range: '5000000-10000000', image: priceFilter3, color: 'from-purple-400 to-pink-500', desc: 'Acc VIP nhiều đồ' },
              { label: '10 - 20 Triệu', range: '10000000-20000000', image: priceFilter4, color: 'from-yellow-400 to-orange-500', desc: 'Acc siêu VIP rare' },
              { label: 'Trên 20 Triệu', range: '20000000-999999999', image: priceFilter5, color: 'from-yellow-400 to-orange-500', desc: 'Acc siêu VIP rare' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={"/accounts"} state={{ priceRange: item.range }}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-3xl bg-card border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 cute-shadow cursor-pointer group overflow-hidden"
                  >
                    <div className="relative h-36 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.label}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <div className="p-4 text-center">
                      <div className={`inline-block px-4 py-2 rounded-2xl bg-gradient-to-r ${item.color} text-white font-bold mb-2`}>
                        {item.label}
                      </div>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/accounts">
              <Button variant="outline" className="gap-2 rounded-2xl border-2 border-primary/40 hover:bg-primary/10">
                Xem tất cả acc 🎮
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-20 bg-gradient-to-r from-[hsl(var(--pastel-pink)/0.4)] via-[hsl(var(--pastel-blue)/0.3)] to-[hsl(var(--pastel-yellow)/0.4)]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Star className="h-7 w-7 text-warning fill-warning" />
                </motion.div>
              ))}
            </div>
            <h2 className="font-gaming text-3xl md:text-4xl font-bold">
              Sẵn sàng chơi Play Together? 🎮💖
            </h2>
            <p className="text-muted-foreground text-lg">
              Mua acc ngay hôm nay để nhận ưu đãi đặc biệt! Hỗ trợ 24/7 ✨
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/accounts">
                <Button className="btn-gaming text-lg px-8 py-6 gap-2">
                  <Heart className="h-5 w-5" />
                  Mua Acc Ngay
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section> */}
    </Layout>
  );
}