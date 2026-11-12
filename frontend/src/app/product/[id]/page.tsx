'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore, Product } from '@/store/useStore';
import { Star, ShieldAlert, CheckCircle, ShoppingCart, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileProductPage from '@/components/mobile-product-page';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const { products, addToCart, fetchProducts } = useStore();
  const [liveProduct, setLiveProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { isMobile, isMounted } = useIsMobile();

  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([
    { author: 'Imtiaz Alam', rating: 5, date: '2026-07-11', text: 'Stunning audio clarity! The noise cancellation blocks office chatter completely. Worth the price.' },
    { author: 'Farhana Yeasmin', rating: 4, date: '2026-07-08', text: 'Comfortable fit for long hours. Premium yellow highlighting on Zibonbaba packaging looked amazing.' }
  ]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
    if (id) {
      setLoading(true);
      fetch(`/api/products/${id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.product) setLiveProduct(data.product);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id, fetchProducts, products.length]);

  const product = liveProduct || products.find((p) => p.id === id);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor || !newText) {
      alert('Please fill out name and review text.');
      return;
    }
    const newRev = {
      author: newAuthor,
      rating: newRating,
      date: new Date().toISOString().split('T')[0],
      text: newText,
    };
    setReviews([newRev, ...reviews]);
    setNewAuthor('');
    setNewText('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        {loading ? (
          <>
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-400">Loading product details...</p>
          </>
        ) : (
          <>
            <p className="text-base font-bold text-slate-700">Product not found or unavailable.</p>
            <Link href="/" className="text-xs text-amber-500 font-bold hover:underline">
              Return to Marketplace
            </Link>
          </>
        )}
      </div>
    );
  }

  if (isMobile && isMounted) {
    return <MobileProductPage product={product} />;
  }

  const priceNum = Number(product.price) || 0;
  const vendorName = product.vendor || 'Verified Merchant';
  const defaultImg = product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
  const mainImg = selectedImage || defaultImg;
  const galleryImages = [
    defaultImg,
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60'
  ];

  return (
    <div className="max-w-[1440px] mx-auto py-10 px-4 lg:px-8 animate-slide-up space-y-10">
      {/* Back to Shop link */}
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-dark hover:text-primary-dark transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
      </div>

      {/* Main product columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 lg:p-10 rounded-2xl border border-neutral-light shadow-card">
        {/* Left Column: Image Container */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-neutral-light rounded-xl overflow-hidden border border-neutral-light">
            <img src={mainImg} alt={product.name || 'Product'} className="object-cover w-full h-full transition-all duration-300" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`aspect-square bg-neutral-light rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  mainImg === img ? 'border-amber-500 shadow-sm scale-102' : 'border-neutral-light hover:border-amber-300 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Meta details and checkout options */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                Verified Seller: {vendorName}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> In Stock ({product.stock ?? 10} units)
              </span>
            </div>
            <h1 className="text-3xl font-black text-neutral-dark mt-3">{product.name}</h1>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs font-black text-neutral-dark flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-warning fill-current" />
                {product.rating || '4.8'}
              </span>
              <span className="text-xs text-neutral-muted">({reviews.length} Customer reviews)</span>
            </div>
          </div>

          <div className="py-4 border-t border-b border-neutral-light flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-muted font-bold">SKU: <span className="font-mono text-neutral-dark font-bold">{product.sku || 'SKU-NONE'}</span></p>
              <p className="text-3xl font-black text-neutral-dark mt-1">৳{priceNum.toFixed(2)}</p>
            </div>
            <div className="text-right text-xs">
              <p className="text-neutral-muted font-bold">Category</p>
              <p className="font-black text-neutral-dark mt-1">{product.category || 'General'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-neutral-dark uppercase tracking-wider mb-2">Description</h3>
            <p className="text-xs text-neutral-body leading-relaxed">{product.description || 'No description provided.'}</p>
          </div>

          {/* Quantity selector and Cart controls */}
          <div className="space-y-4 pt-4 border-t border-neutral-light">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center justify-between border border-neutral-light rounded-xl bg-neutral-light overflow-hidden h-12 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-xs font-bold hover:bg-neutral-muted/20 h-full flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 text-xs font-extrabold text-neutral-dark">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-xs font-bold hover:bg-neutral-muted/20 h-full flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  addToCart(product, quantity);
                  alert(`${quantity} units of "${product.name}" added to cart!`);
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>

              <button
                type="button"
                onClick={() => {
                  addToCart(product, quantity);
                  router.push('/checkout');
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
              >
                Buy Now
              </button>
            </div>

            {/* Marketplace Guarantees Badge */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-light text-center text-[10px]">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-extrabold text-slate-800 block">✓ Genuine Product</span>
                <span className="text-slate-400">100% authentic warranty</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-extrabold text-slate-800 block">✓ Express Delivery</span>
                <span className="text-slate-400">All 64 districts in BD</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-extrabold text-slate-800 block">✓ 7 Days Return</span>
                <span className="text-slate-400">Buyer protection policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review System Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Reviews List */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-2xl border border-neutral-light shadow-card space-y-6">
          <h2 className="text-lg font-bold text-neutral-dark border-b border-neutral-light pb-3">
            Customer Reviews ({reviews.length})
          </h2>
          <div className="space-y-4 divide-y divide-neutral-light">
            {reviews.map((rev, i) => (
              <div key={i} className={`${i > 0 ? 'pt-4' : ''}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-dark">{rev.author}</h4>
                  <span className="text-[10px] text-neutral-muted">{rev.date}</span>
                </div>
                <div className="flex items-center gap-0.5 my-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-3 h-3 ${idx < rev.rating ? 'text-warning fill-current' : 'text-neutral-muted'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-neutral-body leading-relaxed">{rev.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Write a Review Form */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-light shadow-card h-fit space-y-4">
          <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-2">
            Write verified Review
          </h2>
          {reviewSuccess && (
            <div className="bg-success/15 border border-success text-success text-[10px] p-2.5 rounded-xl font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Review posted successfully to store logs.
            </div>
          )}
          <form onSubmit={handleAddReview} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-neutral-muted mb-1">Your Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rana Ahmed"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                className="w-full bg-neutral-light border border-neutral-light rounded-xl p-2.5 text-xs text-neutral-dark outline-none focus:border-amber-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-muted mb-1">Rating Stars *</label>
              <select
                value={newRating}
                onChange={(e) => setNewRating(parseInt(e.target.value))}
                className="w-full bg-neutral-light border border-neutral-light rounded-xl p-2.5 text-xs text-neutral-dark outline-none focus:border-amber-500 font-semibold"
              >
                <option value="5">5 Stars (Excellent)</option>
                <option value="4">4 Stars (Good)</option>
                <option value="3">3 Stars (Average)</option>
                <option value="2">2 Stars (Poor)</option>
                <option value="1">1 Star (Very Poor)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-muted mb-1">Review Description *</label>
              <textarea
                required
                placeholder="Describe your purchase, shipping velocity, or vendor quality..."
                rows={3}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full bg-neutral-light border border-neutral-light rounded-xl p-2.5 text-xs text-neutral-dark outline-none focus:border-amber-500 resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black py-3 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-sm"
            >
              <Send className="w-3 h-3" />
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
