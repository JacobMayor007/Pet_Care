import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase/config";

const fetchProduct = async () => {
  try {
    const productRef = collection(db, "products");
    const querySnapshot = await getDocs(productRef);

    // Map through documents and create the products array
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(products); // Log the fetched products for debugging
    return products; // Return the products array
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; // Return an empty array in case of error
  }
};

export default fetchProduct;
