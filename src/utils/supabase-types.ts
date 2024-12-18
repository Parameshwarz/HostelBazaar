export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          created_at: string;
        };
      };
      subcategories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category_id: string;
          created_at: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          avatar_url?: string;
          created_at: string;
        };
      };
      items: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number;
          condition: string;
          category_id: string;
          subcategory_id: string | null;
          images: string[];
          uploader_id: string;
          hostel_name: string;
          room_number: string;
          is_negotiable: boolean;
          created_at: string;
        };
      };
    };
  };
};