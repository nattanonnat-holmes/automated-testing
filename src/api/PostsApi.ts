import { APIRequestContext, APIResponse } from '@playwright/test';

export type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

export type CreatePost = Omit<Post, 'id'>;

export class PostsApi {
  constructor(private readonly request: APIRequestContext) {}

  async getById(id: number): Promise<APIResponse> {
    return this.request.get(`/posts/${id}`);
  }

  async getAll(): Promise<APIResponse> {
    return this.request.get('/posts');
  }

  async create(post: CreatePost): Promise<APIResponse> {
    return this.request.post('/posts', { data: post });
  }
}
