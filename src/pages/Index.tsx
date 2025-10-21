import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Icon from '@/components/ui/icon';

const Index = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://functions.poehali.dev/7d5abea6-d0fe-4ad7-a1ec-5f70ddc8f5f1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Успешно отправлено!",
          description: "Мы получили ваше сообщение и скоро свяжемся с вами.",
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось отправить сообщение",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Icon name="Rocket" className="text-blue-600" size={32} />
            <span className="text-2xl font-bold text-gray-800">ТехСервис</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#services" className="text-gray-600 hover:text-blue-600 transition">Услуги</a>
            <a href="#about" className="text-gray-600 hover:text-blue-600 transition">О нас</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 transition">Контакты</a>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Профессиональный ремонт техники
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Быстро, качественно и с гарантией. Ремонтируем смартфоны, ноутбуки, планшеты и другую технику.
          </p>
          <a href="#contact">
            <Button size="lg" className="text-lg px-8 py-6">
              Оставить заявку
            </Button>
          </a>
        </section>

        <section id="services" className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Наши услуги</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="mb-4">
                <Icon name="Smartphone" className="text-blue-600" size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Ремонт смартфонов</h3>
              <p className="text-gray-600">Замена экранов, батарей, камер и других компонентов</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="mb-4">
                <Icon name="Laptop" className="text-blue-600" size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Ремонт ноутбуков</h3>
              <p className="text-gray-600">Чистка, замена комплектующих, установка ПО</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="mb-4">
                <Icon name="Tablet" className="text-blue-600" size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Ремонт планшетов</h3>
              <p className="text-gray-600">Устранение любых неисправностей планшетов</p>
            </div>
          </div>
        </section>

        <section id="about" className="mb-20 bg-white p-12 rounded-xl shadow-lg">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Почему выбирают нас</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">5+</div>
                <p className="text-gray-600">лет опыта</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
                <p className="text-gray-600">довольных клиентов</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">90%</div>
                <p className="text-gray-600">ремонтов за 1 день</p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Оставьте заявку</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Ваше имя</label>
                <Input
                  type="text"
                  placeholder="Введите ваше имя"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Сообщение</label>
                <Textarea
                  placeholder="Опишите проблему с вашим устройством"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
              </Button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 ТехСервис. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
