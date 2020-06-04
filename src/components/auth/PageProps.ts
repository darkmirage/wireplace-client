import { RouteComponentProps } from 'react-router-dom';

export type RouteState = { from: string };
export type PageProps = RouteComponentProps<
  {
    userId?: string;
    roomId?: string;
  },
  {},
  RouteState | undefined
>;
