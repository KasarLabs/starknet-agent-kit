import Sidebar from '../components/Sidebar/Sidebar';
import Main from '../components/Main/Main';

export default function Home() {
  return (
    <div className="flex flex-1 w-full">
      <Sidebar />
      <Main />
    </div>
  );
}
