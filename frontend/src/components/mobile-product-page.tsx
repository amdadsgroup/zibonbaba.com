'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Product } from '@/store/useStore';
import { Star, ShieldCheck, Heart, ShoppingCart, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MobileProductPage({ product }: { product: Product }) {
  const router = useRouter();
  const { products, addToCart, wishlist, toggleWishlist } = useStore();

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([
    { author: 'Imtiaz Alam', rating: 5, date: '2026-07-11', text: 'Stunning audio clarity! The noise cancellation blocks office chatter completely. Worth the price.' },
    { author: 'Farhana Yeasmin', rating: 4, date: '2026-07-08', text: 'Comfortable fit for long hours. Premium yellow highlighting on Zibonbaba packaging looked amazing.' }
  ]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Write to Recently Viewed list on mount
  useEffect(() => {
    if (product && product.id) {
      try {
        const recentIds = localStorage.getItem('zibonbaba-recent');
        let ids: string[] = [];
        if (recentIds) {
          ids = JSON.parse(recentIds);
        }
        ids = [product.id, ...ids.filter(id => id !== product.id)].slice(0, 8);
        localStorage.setItem('zibonbaba-recent', JSON.stringify(ids));
      } catch (err) {
        console.error('Failed to update recently viewed list', err);
      }
    }
  }, [product]);

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

  const isWished = wishlist && Array.isArray(wishlist) ? wishlist.includes(product.id) : false;
  const relatedProducts = products && Array.isArray(products) 
    ? products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3) 
    : [];

  const mainImg = product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
  const galleryImages = [
    mainImg,
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60'
  ];

  const priceNum = Number(product.price) || 0;
  const vendorName = product.vendor || 'Verified Merchant';

  return (
    <div className="flex-grow bg-neutral-light pb-28 overflow-y-auto animate-slide-up md:hidden">
      {/* Back button & Wishlist float header */}
      <div className="absolute top-3 left-4 right-4 z-20 flex justify-between items-center">
        <Link 
          href="/" 
          className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center border border-neutral-light shadow-sm text-neutral-dark active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <button
          onClick={() => toggleWishlist(product.id)}
          className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center border border-neutral-light shadow-sm text-neutral-muted hover:text-error active:scale-90"
        >
          <Star className={`w-4 h-4 ${isWished ? 'text-warning fill-current' : ''}`} />
        </button>
      </div>

      {/* Swipeable Gallery container */}
      <div className="relative w-full aspect-square bg-white border-b border-neutral-light overflow-hidden">
        <div className="w-full h-full flex transition-transform duration-300" style={{ transform: `translateX(-${activeImgIndex * 100}%)` }}>
          {galleryImages.map((img, idx) => (
            <div key={idx} className="w-full h-full shrink-0">
              <img src={img} alt={`${product.name || 'Product'} - ${idx}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        
        {/* Carousel indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
          {galleryImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImgIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === activeImgIndex ? 'bg-primary w-4' : 'bg-neutral-muted/40'}`}
            ></button>
          ))}
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 bg-white border-b border-neutral-light/70 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="bg-primary/20 text-neutral-dark text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full">
            {product.category || 'General'}
          </span>
          <span className="text-[10px] text-success font-bold flex items-center gap-0.5">
            <CheckCircle className="w-3.5 h-3.5" /> In Stock ({product.stock ?? 10} units)
          </span>
        </div>

        <h1 className="text-base font-black text-neutral-dark leading-tight">{product.name}</h1>
        
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 text-warning">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-black text-neutral-dark">{product.rating || '4.8'}</span>
          </div>
          <span className="text-[10px] text-neutral-muted">({reviews.length} Verified Reviews)</span>
        </div>

        <div className="flex items-baseline gap-2 pt-2 border-t border-neutral-light/50">
          <span className="text-xl font-black text-neutral-dark">৳{priceNum.toFixed(2)}</span>
          <span className="text-[9px] text-neutral-muted font-bold font-mono">SKU: {product.sku || 'SKU-NONE'}</span>
        </div>
      </div>

      {/* Vendor Profile Info */}
      <div className="mt-3.5 bg-white p-4 border-t border-b border-neutral-light/70 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-neutral-dark text-sm border border-primary uppercase">
            {vendorName.charAt(0) || 'V'}
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-dark">{vendorName}</h3>
            <p className="text-[9px] text-neutral-muted">Verified Marketplace Partner</p>
          </div>
        </div>
        <div className="text-right text-[10px]">
          <span className="text-success font-bold block">✓ Fast Shipping</span>
          <span className="text-neutral-muted block">Dhaka Hub Direct</span>
        </div>
      </div>

      {/* Description */}
      <div className="mt-3.5 bg-white p-4 border-t border-b border-neutral-light/70 shadow-sm space-y-2">
        <h3 className="text-[10px] font-black text-neutral-dark uppercase tracking-wider">Specifications</h3>
        <p className="text-xs text-neutral-body leading-relaxed">{product.description || 'No detailed specifications provided.'}</p>
      </div>

      {/* Quantity Selector inside body */}
      <div className="mt-3.5 bg-white p-4 border-t border-b border-neutral-light/70 shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-dark">Purchase Qty</span>
        <div className="flex items-center border border-neutral-light rounded bg-neutral-light overflow-hidden h-7">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 font-bold text-xs hover:bg-neutral-muted/20 active:bg-neutral-muted/40 h-full flex items-center justify-center cursor-pointer"
          >
            -
          </button>
          <span className="px-4 text-xs font-extrabold text-neutral-dark">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 font-bold text-xs hover:bg-neutral-muted/20 active:bg-neutral-muted/40 h-full flex items-center justify-center cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* Reviews list */}
      <div className="mt-3.5 bg-white p-4 border-t border-b border-neutral-light/70 shadow-sm space-y-4">
        <h3 className="text-[10px] font-black text-neutral-dark uppercase tracking-wider">Customer Reviews ({reviews.length})</h3>
        
        <div className="space-y-3 divide-y divide-neutral-light">
          {reviews.map((rev, i) => (
            <div key={i} className={`${i > 0 ? 'pt-3' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-dark">{rev.author}</span>
                <span className="text-[8px] text-neutral-muted">{rev.date}</span>
              </div>
              <div className="flex items-center gap-0.5 my-1 text-warning">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-2.5 h-2.5 ${idx < rev.rating ? 'fill-current' : 'text-neutral-muted'}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-neutral-body leading-relaxed">{rev.text}</p>
            </div>
          ))}
        </div>

        {/* Post review */}
        <div className="border-t border-neutral-light/50 pt-4 space-y-3">
          <h4 className="text-[9px] font-bold text-neutral-dark uppercase">Write a Review</h4>
          {reviewSuccess && (
            <div className="bg-success/15 border border-success text-success text-[9px] p-2 rounded font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Review submitted!
            </div>
          )}
          <form onSubmit={handleAddReview} className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Name"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                className="bg-neutral-light border border-neutral-light rounded p-2 text-[10px] text-neutral-dark outline-none focus:border-primary font-semibold"
              />
              <select
                value={newRating}
                onChange={(e) => setNewRating(parseInt(e.target.value))}
                className="bg-neutral-light border border-neutral-light rounded p-2 text-[10px] text-neutral-dark outline-none focus:border-primary font-semibold"
              >
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Add review feedback..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="flex-grow bg-neutral-light border border-neutral-light rounded p-2 text-[10px] text-neutral-dark outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="bg-primary text-neutral-dark p-2 rounded shadow active:scale-95 flex items-center justify-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-3.5 bg-white p-4 border-t border-b border-neutral-light/70 shadow-sm space-y-3">
          <h3 className="text-[10px] font-black text-neutral-dark uppercase tracking-wider">Related Products</h3>
          <div className="grid grid-cols-3 gap-2">
            {relatedProducts.map(p => (
              <Link 
                key={p.id} 
                href={`/product/${p.id}`}
                className="bg-neutral-light border border-neutral-light rounded p-1.5 flex flex-col justify-between active:scale-95 transition-transform"
              >
                <div className="aspect-square bg-white rounded overflow-hidden mb-1">
                  <img src={p.image} alt={p.name} className="object-cover w-full h-full" />
                </div>
                <h4 className="text-[8px] font-bold text-neutral-dark line-clamp-1 leading-tight">{p.name}</h4>
                <span className="text-[9px] font-black text-neutral-dark mt-1 block">৳{(Number(p.price) || 0).toFixed(2)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* STICKY BOTTOM BUTTONS */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-neutral-light/70 p-3 pb-safe flex gap-3 shadow-glow md:hidden">
        <button
          onClick={() => {
            addToCart(product, quantity);
            alert(`${quantity} units of "${product.name}" added to cart!`);
          }}
          className="flex-1 border border-neutral-dark hover:bg-neutral-light text-neutral-dark text-xs font-bold py-3.5 rounded-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
        <button
          onClick={() => {
            addToCart(product, quantity);
            router.push('/checkout');
          }}
          className="flex-1 bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-black py-3.5 rounded-md flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
