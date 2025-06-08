# AI Model Yanıtı

Tarih: 2025-06-08T22:22:15.008Z
Trace ID: quiz-1749421322905-35oid
Yanıt Uzunluğu: 8310 karakter

## Ham Çıktı:
```json
```json
{
  "questions": [
    {
      "id": "q1",
      "questionText": "KVM (Kernel-based Virtual Machine) nedir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Bir işletim sistemi",
        "Bir uygulama geliştirme aracı",
        "Bir Tip-1 hipervizör",
        "Bir veritabanı yönetim sistemi"
      ],
      "correctAnswer": "Bir Tip-1 hipervizör",
      "explanation": "KVM, çekirdek tabanlı bir sanallaştırma çözümüdür ve Tip-1 hipervizör olarak sınıflandırılır. Bu, doğrudan donanım üzerinde çalıştığı anlamına gelir.",
      "subTopicName": "Kvm Hypervisor Kurulumu",
      "normalizedSubTopicName": "kvm_hypervisor_kurulumu",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "Aşağıdakilerden hangisi KVM kurulumu için gerekli adımlardan biri değildir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "Gerekli paketlerin yüklenmesi",
        "Libvirtd servisinin başlatılması",
        "Kullanıcının kvm grubuna eklenmesi",
        "İşletim sisteminin yeniden kurulması"
      ],
      "correctAnswer": "İşletim sisteminin yeniden kurulması",
      "explanation": "KVM kurulumu için işletim sisteminin yeniden kurulması gerekmez. Gerekli paketlerin yüklenmesi, libvirtd servisinin başlatılması ve kullanıcının kvm grubuna eklenmesi kurulum adımlarıdır.",
      "subTopicName": "Kvm Hypervisor Kurulumu",
      "normalizedSubTopicName": "kvm_hypervisor_kurulumu",
      "difficulty": "medium"
    },
    {
      "id": "q3",
      "questionText": "KVM kurulumu için hangi paketler gereklidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "qemu-kvm, virt-manager, libvirt-daemon-system, virtinst, libvirt-clients, bridge-utils",
        "docker, kubernetes, ansible",
        "apache2, mysql, php",
        "git, vim, gcc"
      ],
      "correctAnswer": "qemu-kvm, virt-manager, libvirt-daemon-system, virtinst, libvirt-clients, bridge-utils",
      "explanation": "Metinde belirtildiği gibi, KVM kurulumu için gerekli paketler şunlardır: qemu-kvm, virt-manager, libvirt-daemon-system, virtinst, libvirt-clients, bridge-utils.",
      "subTopicName": "Gerekli Paketlerin Kurulumu",
      "normalizedSubTopicName": "gerekli_paketlerin_kurulumu",
      "difficulty": "easy"
    },
    {
      "id": "q4",
      "questionText": "Aşağıdaki komutlardan hangisi KVM için gerekli paketleri kurmak için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo apt update && sudo apt install -y kvm",
        "sudo apt update && sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils",
        "sudo yum install kvm",
        "sudo pacman -S kvm"
      ],
      "correctAnswer": "sudo apt update && sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils",
      "explanation": "Metinde belirtildiği gibi, KVM için gerekli paketleri kurmak için kullanılan komut 'sudo apt update && sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils' şeklindedir.",
      "subTopicName": "Gerekli Paketlerin Kurulumu",
      "normalizedSubTopicName": "gerekli_paketlerin_kurulumu",
      "difficulty": "medium"
    },
    {
      "id": "q5",
      "questionText": "/etc/libvirt/qemu.conf dosyasında hangi değişiklikler yapılması önerilir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Dosyanın silinmesi",
        "#user ve #group satırlarının başındaki # işaretinin kaldırılması",
        "Dosyanın salt okunur yapılması",
        "Dosyaya yeni kullanıcılar eklenmesi"
      ],
      "correctAnswer": "#user ve #group satırlarının başındaki # işaretinin kaldırılması",
      "explanation": "Metinde belirtildiği gibi, /etc/libvirt/qemu.conf dosyasında #user ve #group satırlarının başındaki # işaretinin kaldırılması önerilir.",
      "subTopicName": "Libvirtd Servisini Yapılandırma",
      "normalizedSubTopicName": "libvirtd_servisini_yapilandirma",
      "difficulty": "medium"
    },
    {
      "id": "q6",
      "questionText": "Libvirtd servisinin yeniden başlatılması için hangi komut kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo systemctl stop libvirtd.service",
        "sudo systemctl restart libvirtd.service",
        "sudo systemctl disable libvirtd.service",
        "sudo systemctl kill libvirtd.service"
      ],
      "correctAnswer": "sudo systemctl restart libvirtd.service",
      "explanation": "Metinde belirtildiği gibi, Libvirtd servisinin yeniden başlatılması için 'sudo systemctl restart libvirtd.service' komutu kullanılır.",
      "subTopicName": "Libvirtd Servisini Yapılandırma",
      "normalizedSubTopicName": "libvirtd_servisini_yapilandirma",
      "difficulty": "easy"
    },
    {
      "id": "q7",
      "questionText": "Yeni bir sanal makine oluşturmak için kullanılan 'virt-install' komutunda, '--os-variant' parametresi neyi belirtir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sanal makinenin adını",
        "Sanal makine için kullanılacak işletim sistemi varyantını",
        "Sanal makineye ayrılacak RAM miktarını",
        "Sanal makine için kullanılacak disk yolunu"
      ],
      "correctAnswer": "Sanal makine için kullanılacak işletim sistemi varyantını",
      "explanation": "'--os-variant' parametresi, sanal makine için kullanılacak işletim sistemi varyantını belirtir. Örneğin, ubuntu22.04.",
      "subTopicName": "Virt İnstallıkomutu Kullanımı",
      "normalizedSubTopicName": "virt_installikomutu_kullanimi",
      "difficulty": "medium"
    },
    {
      "id": "q8",
      "questionText": "'virt-install' komutunda '--cdrom' parametresi ne işe yarar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "Sanal makineye bir CD-ROM sürücüsü ekler",
        "Sanal makineye bir ISO imajı bağlar",
        "Sanal makinenin CD-ROM sürücüsünü çıkarır",
        "Sanal makinenin CD-ROM sürücüsünü günceller"
      ],
      "correctAnswer": "Sanal makineye bir ISO imajı bağlar",
      "explanation": "'--cdrom' parametresi, sanal makineye bir ISO imajı bağlamak için kullanılır. Bu, sanal makineyi bir ISO imajından başlatmayı sağlar.",
      "subTopicName": "Virt İnstallıkomutu Kullanımı",
      "normalizedSubTopicName": "virt_installikomutu_kullanimi",
      "difficulty": "easy"
    },
    {
      "id": "q9",
      "questionText": "Çalışır durumdaki sanal makineyi görüntülemek için hangi 'virsh' komutu kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "virsh list",
        "virt-viewer testVM",
        "virsh start testVM",
        "virsh shutdown testVM"
      ],
      "correctAnswer": "virt-viewer testVM",
      "explanation": "Çalışır durumdaki sanal makineyi görüntülemek için 'virt-viewer testVM' komutu kullanılır.",
      "subTopicName": "Virsh Komutları İle Yönetim",
      "normalizedSubTopicName": "virsh_komutlari_ile_yonetim",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "Bir sanal makineyi silmek için hangi 'virsh' komutları sırasıyla kullanılmalıdır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "virsh shutdown testVM; virsh undefine testVM",
        "virsh destroy testVM; virsh undefine testVM",
        "virsh suspend testVM; virsh undefine testVM",
        "virsh reboot testVM; virsh undefine testVM"
      ],
      "correctAnswer": "virsh destroy testVM; virsh undefine testVM",
      "explanation": "Bir sanal makineyi silmek için önce 'virsh destroy testVM' komutu ile sanal makine kapatılmalı, ardından 'virsh undefine testVM' komutu ile sanal makine sistemden kaldırılmalıdır.",
      "subTopicName": "Virsh Komutları İle Yönetim",
      "normalizedSubTopicName": "virsh_komutlari_ile_yonetim",
      "difficulty": "medium"
    }
  ]
}
```
```
