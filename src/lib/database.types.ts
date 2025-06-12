export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: string;
          first_name: string | null;
          last_name: string | null;
          company: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: string;
          first_name?: string | null;
          last_name?: string | null;
          company?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          first_name?: string | null;
          last_name?: string | null;
          company?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}