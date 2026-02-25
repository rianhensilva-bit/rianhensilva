import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, CheckCircle } from 'lucide-react';

export default function UserManualModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#D4AF37]" />
            Manual do Usuário - Como Criar Previsões
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
          <section>
            <h3 className="text-lg font-bold mb-3 text-[#D4AF37]">1. Tipos de Previsões</h3>
            <div className="space-y-3 pl-4">
              <div>
                <h4 className="font-semibold mb-1 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Sim vs Não
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Use para previsões binárias como "Brasil vai ganhar a Copa 2026?" ou "Vai chover amanhã em São Paulo?".
                  Os jogadores podem apostar em SIM ou NÃO.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Múltipla Escolha
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Use para previsões com várias opções como "Quem vai ganhar a Champions?" com opções: Barcelona, Real Madrid, Arsenal, etc.
                  Você pode adicionar quantas opções desejar clicando em "+ Adicionar Opção".
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3 text-[#D4AF37]">2. Passo a Passo</h3>
            <ol className="space-y-2 list-decimal list-inside text-sm text-zinc-600 dark:text-zinc-400">
              <li>Clique no botão "Criar Nova Previsão"</li>
              <li>Escreva um título claro e objetivo (ex: "Vai chover em São Paulo amanhã?")</li>
              <li>Adicione uma descrição detalhada (opcional mas recomendado)</li>
              <li>Escolha o tipo de previsão: "Sim vs Não" ou "Múltipla Escolha"</li>
              <li>Se for múltipla escolha, adicione as opções disponíveis</li>
              <li>Selecione a categoria apropriada (Política, Esporte, etc.)</li>
              <li>Defina a data de encerramento da previsão</li>
              <li>Clique em "Criar Previsão"</li>
            </ol>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3 text-[#D4AF37]">3. Boas Práticas</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>• Seja específico no título (evite ambiguidade)</li>
              <li>• Escolha datas de encerramento realistas</li>
              <li>• Adicione contexto na descrição quando necessário</li>
              <li>• Verifique se a previsão é verificável e tem um resultado claro</li>
              <li>• Selecione a categoria correta para facilitar a busca dos jogadores</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3 text-[#D4AF37]">4. Gerenciando Previsões</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              Após criar uma previsão, você pode:
            </p>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>• <strong>Editar Data:</strong> Alterar a data de encerramento se necessário</li>
              <li>• <strong>Fechar:</strong> Encerrar apostas antes da data prevista</li>
              <li>• <strong>Resolver:</strong> Marcar o resultado final como SIM ou NÃO após o evento ocorrer</li>
            </ul>
          </section>

          <section className="bg-amber-500/10 border-2 border-amber-500/30 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-2 text-amber-600 dark:text-amber-400">⚠️ Importante</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sempre resolva as previsões de forma justa e honesta. Resultados incorretos podem levar à contestação pelos jogadores
              e análise da equipe GUANXI. Mantenha a integridade da sua sala!
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}