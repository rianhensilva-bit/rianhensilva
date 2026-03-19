import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Crown, AlertCircle, Upload, Building, User, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function BecomeManagerModal({ isOpen, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState('type'); // 'type', 'pf', 'pj'
  const [managerType, setManagerType] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [pfData, setPfData] = useState({
    full_name: '',
    cpf: '',
    birth_date: '',
    nationality: 'Brasileira',
    marital_status: 'solteiro',
    address: '',
    document_type: 'RG',
    document_number: '',
    document_url: '',
    address_proof_url: '',
    selfie_url: ''
  });

  const [pjData, setPjData] = useState({
    full_name: '', // Razão Social
    cnpj: '',
    address: '',
    cnpj_proof_url: '',
    social_contract_url: '',
    last_amendment_url: '',
    legal_representatives: [],
    beneficial_owners: [],
    ownership_structure: ''
  });

  const createVerificationMutation = useMutation({
    mutationFn: (data) => base44.entities.ManagerVerification.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['manager-verification']);
      toast.success('Solicitação enviada! Aguarde aprovação.');
      onClose();
      resetForm();
    },
    onError: () => {
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    }
  });

  const handleFileUpload = async (file, field) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (managerType === 'PF') {
        setPfData({ ...pfData, [field]: file_url });
      } else {
        setPjData({ ...pjData, [field]: file_url });
      }
      
      toast.success('Arquivo enviado com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar arquivo.');
    } finally {
      setUploading(false);
    }
  };

  const addLegalRepresentative = () => {
    setPjData({
      ...pjData,
      legal_representatives: [...pjData.legal_representatives, { name: '', cpf: '', document_url: '' }]
    });
  };

  const addBeneficialOwner = () => {
    setPjData({
      ...pjData,
      beneficial_owners: [...pjData.beneficial_owners, { name: '', cpf: '', ownership_percentage: 0 }]
    });
  };

  const handleSubmitPF = (e) => {
    e.preventDefault();
    
    createVerificationMutation.mutate({
      user_id: 'current-user-id', // Em produção vem do auth
      manager_type: 'PF',
      ...pfData
    });
  };

  const handleSubmitPJ = (e) => {
    e.preventDefault();
    
    createVerificationMutation.mutate({
      user_id: 'current-user-id', // Em produção vem do auth
      manager_type: 'PJ',
      ...pjData
    });
  };

  const resetForm = () => {
    setStep('type');
    setManagerType(null);
    setPfData({
      full_name: '',
      cpf: '',
      birth_date: '',
      nationality: 'Brasileira',
      marital_status: 'solteiro',
      address: '',
      document_type: 'RG',
      document_number: '',
      document_url: '',
      address_proof_url: '',
      selfie_url: ''
    });
    setPjData({
      full_name: '',
      cnpj: '',
      address: '',
      cnpj_proof_url: '',
      social_contract_url: '',
      last_amendment_url: '',
      legal_representatives: [],
      beneficial_owners: [],
      ownership_structure: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { onClose(); resetForm(); }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold elegant-font flex items-center gap-2">
            <Crown className="h-8 w-8 text-[#D4AF37]" />
            Tornar-se Gerente de Sala
          </DialogTitle>
          <DialogDescription>
            Crie e gerencie até 3 salas privadas de previsões
          </DialogDescription>
        </DialogHeader>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Escolha o tipo de cadastro: Pessoa Física ou Pessoa Jurídica
            </p>
          </div>
        </div>

        {/* Seleção de Tipo */}
        {step === 'type' && (
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => { setManagerType('PF'); setStep('pf'); }}
              variant="outline"
              className="h-32 flex flex-col gap-3 hover:border-[#D4AF37]"
            >
              <User className="h-12 w-12 text-[#D4AF37]" />
              <div>
                <p className="font-bold text-lg">Pessoa Física</p>
                <p className="text-sm text-zinc-500">Cadastro individual</p>
              </div>
            </Button>
            <Button
              onClick={() => { setManagerType('PJ'); setStep('pj'); }}
              variant="outline"
              className="h-32 flex flex-col gap-3 hover:border-[#D4AF37]"
            >
              <Building className="h-12 w-12 text-[#D4AF37]" />
              <div>
                <p className="font-bold text-lg">Pessoa Jurídica</p>
                <p className="text-sm text-zinc-500">Cadastro empresarial</p>
              </div>
            </Button>
          </div>
        )}

        {/* Formulário Pessoa Física */}
        {step === 'pf' && (
          <form onSubmit={handleSubmitPF} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome Completo *</Label>
                <Input
                  required
                  value={pfData.full_name}
                  onChange={(e) => setPfData({ ...pfData, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label>CPF *</Label>
                <Input
                  required
                  placeholder="000.000.000-00"
                  value={pfData.cpf}
                  onChange={(e) => setPfData({ ...pfData, cpf: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Data de Nascimento *</Label>
                <Input
                  type="date"
                  required
                  value={pfData.birth_date}
                  onChange={(e) => setPfData({ ...pfData, birth_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Nacionalidade *</Label>
                <Input
                  required
                  value={pfData.nationality}
                  onChange={(e) => setPfData({ ...pfData, nationality: e.target.value })}
                />
              </div>
              <div>
                <Label>Estado Civil *</Label>
                <Select value={pfData.marital_status} onValueChange={(v) => setPfData({ ...pfData, marital_status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                    <SelectItem value="casado">Casado(a)</SelectItem>
                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Endereço Completo *</Label>
              <Input
                required
                value={pfData.address}
                onChange={(e) => setPfData({ ...pfData, address: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Documento *</Label>
                <Select value={pfData.document_type} onValueChange={(v) => setPfData({ ...pfData, document_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RG">RG</SelectItem>
                    <SelectItem value="CNH">CNH</SelectItem>
                    <SelectItem value="Passaporte">Passaporte</SelectItem>
                    <SelectItem value="CIN">CIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Número do Documento *</Label>
                <Input
                  required
                  value={pfData.document_number}
                  onChange={(e) => setPfData({ ...pfData, document_number: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Documento (Foto) *</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'document_url')}
                  disabled={uploading}
                />
                {pfData.document_url && <span className="text-green-600 text-sm">✓</span>}
              </div>
            </div>

            <div>
              <Label>Comprovante de Endereço *</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'address_proof_url')}
                  disabled={uploading}
                />
                {pfData.address_proof_url && <span className="text-green-600 text-sm">✓</span>}
              </div>
            </div>

            <div>
              <Label>Selfie com Documento (Biometria) *</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'selfie_url')}
                  disabled={uploading}
                />
                {pfData.selfie_url && <span className="text-green-600 text-sm">✓</span>}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Tire uma selfie segurando seu documento de identidade</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep('type')} className="flex-1">
                Voltar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold"
                disabled={uploading || createVerificationMutation.isPending}
              >
                Enviar Solicitação
              </Button>
            </div>
          </form>
        )}

        {/* Formulário Pessoa Jurídica */}
        {step === 'pj' && (
          <form onSubmit={handleSubmitPJ} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Razão Social *</Label>
                <Input
                  required
                  value={pjData.full_name}
                  onChange={(e) => setPjData({ ...pjData, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label>CNPJ *</Label>
                <Input
                  required
                  placeholder="00.000.000/0000-00"
                  value={pjData.cnpj}
                  onChange={(e) => setPjData({ ...pjData, cnpj: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Endereço da Empresa *</Label>
              <Input
                required
                value={pjData.address}
                onChange={(e) => setPjData({ ...pjData, address: e.target.value })}
              />
            </div>

            <div>
              <Label>Comprovante de CNPJ *</Label>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileUpload(e.target.files[0], 'cnpj_proof_url')}
                disabled={uploading}
              />
              {pjData.cnpj_proof_url && <span className="text-green-600 text-sm">✓</span>}
            </div>

            <div>
              <Label>Contrato Social *</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileUpload(e.target.files[0], 'social_contract_url')}
                disabled={uploading}
              />
              {pjData.social_contract_url && <span className="text-green-600 text-sm">✓</span>}
            </div>

            <div>
              <Label>Última Alteração Contratual</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileUpload(e.target.files[0], 'last_amendment_url')}
                disabled={uploading}
              />
              {pjData.last_amendment_url && <span className="text-green-600 text-sm">✓</span>}
            </div>

            <div>
              <Label>Representantes Legais *</Label>
              {pjData.legal_representatives.map((rep, idx) => (
                <div key={idx} className="border rounded p-3 mb-2 space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">Representante {idx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newReps = [...pjData.legal_representatives];
                        newReps.splice(idx, 1);
                        setPjData({ ...pjData, legal_representatives: newReps });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Nome completo"
                    value={rep.name}
                    onChange={(e) => {
                      const newReps = [...pjData.legal_representatives];
                      newReps[idx].name = e.target.value;
                      setPjData({ ...pjData, legal_representatives: newReps });
                    }}
                  />
                  <Input
                    placeholder="CPF"
                    value={rep.cpf}
                    onChange={(e) => {
                      const newReps = [...pjData.legal_representatives];
                      newReps[idx].cpf = e.target.value;
                      setPjData({ ...pjData, legal_representatives: newReps });
                    }}
                  />
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setUploading(true);
                        base44.integrations.Core.UploadFile({ file }).then(({ file_url }) => {
                          const newReps = [...pjData.legal_representatives];
                          newReps[idx].document_url = file_url;
                          setPjData({ ...pjData, legal_representatives: newReps });
                          setUploading(false);
                        });
                      }
                    }}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addLegalRepresentative} className="w-full mt-2">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Representante
              </Button>
            </div>

            <div>
              <Label>Beneficiários Finais (≥25% capital) *</Label>
              {pjData.beneficial_owners.map((owner, idx) => (
                <div key={idx} className="border rounded p-3 mb-2 space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">Beneficiário {idx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newOwners = [...pjData.beneficial_owners];
                        newOwners.splice(idx, 1);
                        setPjData({ ...pjData, beneficial_owners: newOwners });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Nome completo"
                    value={owner.name}
                    onChange={(e) => {
                      const newOwners = [...pjData.beneficial_owners];
                      newOwners[idx].name = e.target.value;
                      setPjData({ ...pjData, beneficial_owners: newOwners });
                    }}
                  />
                  <Input
                    placeholder="CPF"
                    value={owner.cpf}
                    onChange={(e) => {
                      const newOwners = [...pjData.beneficial_owners];
                      newOwners[idx].cpf = e.target.value;
                      setPjData({ ...pjData, beneficial_owners: newOwners });
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="% de propriedade"
                    value={owner.ownership_percentage}
                    onChange={(e) => {
                      const newOwners = [...pjData.beneficial_owners];
                      newOwners[idx].ownership_percentage = parseFloat(e.target.value);
                      setPjData({ ...pjData, beneficial_owners: newOwners });
                    }}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addBeneficialOwner} className="w-full mt-2">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Beneficiário
              </Button>
            </div>

            <div>
              <Label>Estrutura de Propriedade *</Label>
              <Textarea
                required
                placeholder="Descreva a cadeia de controle da empresa..."
                value={pjData.ownership_structure}
                onChange={(e) => setPjData({ ...pjData, ownership_structure: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep('type')} className="flex-1">
                Voltar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold"
                disabled={uploading || createVerificationMutation.isPending}
              >
                Enviar Solicitação
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}