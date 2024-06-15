type PostComponentType = "header" | "description" | "list" | "devider";

export interface PostComponent {
  type: PostComponentType;
}
export const PostComponent = {
  header: (text: string): Header => ({
    type: "header",
    text,
  }),
  description: (text: string, button?: {
    label: string;
    style: "primary" | "secondary";
    actionId: string;
  }): Description => ({
    type: "description",
    text,
    button,
  }),
  list: (values: string[]): List => ({
    type: "list",
    values,
  }),
  devider: (): Devider => ({
    type: "devider",
  }),
};

export interface Header extends PostComponent {
  type: "header";
  text: string;
}

export interface Description extends PostComponent {
  type: "description";
  text: string;
  button?: {
    label: string;
    style: "primary" | "secondary";
    actionId: string;
  };
}

export interface List extends PostComponent {
  type: "list";
  values: string[];
}

export interface Devider extends PostComponent {
  type: "devider";
}

export interface Post {
  content: PostComponent[];
  altText: string;
}
