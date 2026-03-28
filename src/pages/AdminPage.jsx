import { Studio } from 'sanity';
import config from '../sanity/sanity.config';

export default function AdminPage() {
  return (
    <div className="h-screen max-h-screen w-full overflow-hidden absolute top-0 left-0 bg-black z-[99999]">
      <Studio config={config} />
    </div>
  );
}
