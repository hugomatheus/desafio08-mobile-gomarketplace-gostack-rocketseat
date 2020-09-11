import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storageProducts = await AsyncStorage.getItem(
        '@GoMarketplace:productsTest',
      );

      if (storageProducts) {
        setProducts([...JSON.parse(storageProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART

      const findProduct = products.find(element => element.id === product.id);
      let cart: Product[] = [];
      if (findProduct) {
        cart = products.map(element =>
          element.id === product.id
            ? { ...element, quantity: element.quantity + 1 }
            : element,
        );
      } else {
        cart = [...products, { ...product, quantity: 1 }];
      }
      setProducts(cart);
      await AsyncStorage.setItem(
        '@GoMarketplace:productsTest',
        JSON.stringify(cart),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const cart = products.map(element =>
        element.id === id
          ? { ...element, quantity: element.quantity + 1 }
          : element,
      );
      setProducts(cart);
      await AsyncStorage.setItem(
        '@GoMarketplace:productsTest',
        JSON.stringify(cart),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const findProduct = products.find(element => element.id === id);
      let cart: Product[] = [];
      if (findProduct && findProduct.quantity > 1) {
        cart = products.map(element =>
          element.id === id
            ? { ...element, quantity: element.quantity - 1 }
            : element,
        );
      } else {
        cart = products.filter(element => element.id !== id);
      }
      setProducts(cart);
      await AsyncStorage.setItem(
        '@GoMarketplace:productsTest',
        JSON.stringify(cart),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
