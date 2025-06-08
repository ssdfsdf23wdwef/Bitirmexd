# AI Model Yanıtı

Tarih: 2025-06-08T01:38:41.050Z
Trace ID: quiz-1749346708280-w5pas
Yanıt Uzunluğu: 7586 karakter

## Ham Çıktı:
```json
```json
{
  "questions": [
    {
      "id": "q1",
      "questionText": "KVM (Kernel-based Virtual Machine) hangi tip bir hypervisor'dır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "Tip-1 Hypervisor",
        "Tip-2 Hypervisor",
        "Hibrit Hypervisor",
        "Mikro Hypervisor"
      ],
      "correctAnswer": "Tip-1 Hypervisor",
      "explanation": "KVM, doğrudan donanım üzerinde çalıştığı için Tip-1 hypervisor olarak sınıflandırılır. Tip-2 hypervisor'lar ise bir işletim sistemi üzerinde çalışır.",
      "subTopicName": "Kvm Tip 1 Hypervisor Kurulumu",
      "normalizedSubTopicName": "kvm_tip_1_hypervisor_kurulumu",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "Ubuntu imajını indirmek için verilen bağlantıdaki hangi mimari (architecture) belirtilmiştir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "i386",
        "amd64",
        "arm64",
        "riscv64"
      ],
      "correctAnswer": "amd64",
      "explanation": "Verilen bağlantıda indirilecek Ubuntu imajının mimarisi amd64 olarak belirtilmiştir.",
      "subTopicName": "Kvm Tip 1 Hypervisor Kurulumu",
      "normalizedSubTopicName": "kvm_tip_1_hypervisor_kurulumu",
      "difficulty": "easy"
    },
    {
      "id": "q3",
      "questionText": "KVM kurulumu için gerekli olan paketlerden hangisi sanal makineleri yönetmek için grafik arayüzü sağlar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "qemu-kvm",
        "libvirt-daemon-system",
        "virt-manager",
        "bridge-utils"
      ],
      "correctAnswer": "virt-manager",
      "explanation": "virt-manager paketi, KVM sanal makinelerini yönetmek için kullanılan grafik arayüzünü sağlar. Diğer paketler ise KVM'nin temel bileşenleridir.",
      "subTopicName": "Gerekli Paketlerin Kurulumu",
      "normalizedSubTopicName": "gerekli_paketlerin_kurulumu",
      "difficulty": "medium"
    },
    {
      "id": "q4",
      "questionText": "KVM kurulumunda, ağ köprülemesi (network bridging) için hangi paket gereklidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "qemu-kvm",
        "virtinst",
        "bridge-utils",
        "libvirt-clients"
      ],
      "correctAnswer": "bridge-utils",
      "explanation": "bridge-utils paketi, KVM sanal makineleri için ağ köprülemesi (network bridging) yapılandırması yapmak için gereklidir.",
      "subTopicName": "Gerekli Paketlerin Kurulumu",
      "normalizedSubTopicName": "gerekli_paketlerin_kurulumu",
      "difficulty": "easy"
    },
    {
      "id": "q5",
      "questionText": "/etc/libvirt/qemu.conf dosyasında hangi satırlardaki '#' işareti kaldırılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "user ve group",
        "pidfile ve log_outputs",
        "dynamic_ownership ve security_driver",
        "Seçeneklerin hiçbiri"
      ],
      "correctAnswer": "user ve group",
      "explanation": "/etc/libvirt/qemu.conf dosyasında, kullanıcı ve grup tanımlarını etkinleştirmek için #user ve #group satırlarındaki '#' işareti kaldırılır.",
      "subTopicName": "Libvirtd Servisini Yapılandırma",
      "normalizedSubTopicName": "libvirtd_servisini_yapilandirma",
      "difficulty": "medium"
    },
    {
      "id": "q6",
      "questionText": "libvirtd servisindeki değişikliklerin uygulanabilmesi için hangi komut çalıştırılmalıdır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo systemctl start libvirtd.service",
        "sudo systemctl stop libvirtd.service",
        "sudo systemctl restart libvirtd.service",
        "sudo systemctl enable libvirtd.service"
      ],
      "correctAnswer": "sudo systemctl restart libvirtd.service",
      "explanation": "libvirtd servisindeki değişikliklerin geçerli olması için servisin yeniden başlatılması gerekmektedir. Bu işlem 'sudo systemctl restart libvirtd.service' komutu ile yapılır.",
      "subTopicName": "Libvirtd Servisini Yapılandırma",
      "normalizedSubTopicName": "libvirtd_servisini_yapilandirma",
      "difficulty": "easy"
    },
    {
      "id": "q7",
      "questionText": "virt-install komutunda, '--os-variant' parametresi neyi belirtir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sanal makinenin adını",
        "İşletim sistemi türünü ve versiyonunu",
        "Sanal işlemci sayısını",
        "Bellek miktarını"
      ],
      "correctAnswer": "İşletim sistemi türünü ve versiyonunu",
      "explanation": "'--os-variant' parametresi, kurulacak sanal makinenin işletim sistemi türünü ve versiyonunu belirtir. Örneğin, ubuntu22.04.",
      "subTopicName": "Virt İnstallıkomutu İle Vm Oluşturma",
      "normalizedSubTopicName": "virt_installikomutu_ile_vm_olusturma",
      "difficulty": "medium"
    },
    {
      "id": "q8",
      "questionText": "virt-install komutunda '--disk path=/var/lib/libvirt/images/testVM.img,size=30' parametresi ne anlama gelir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sanal makinenin ISO dosyasının yolunu belirtir.",
        "Sanal makine için 30GB'lık bir disk oluşturulacağını ve konumunu belirtir.",
        "Sanal makineye 30GB RAM atanacağını belirtir.",
        "Sanal makineye 30 adet sanal CPU atanacağını belirtir."
      ],
      "correctAnswer": "Sanal makine için 30GB'lık bir disk oluşturulacağını ve konumunu belirtir.",
      "explanation": "Bu parametre, sanal makine için /var/lib/libvirt/images/ dizininde testVM.img adında 30GB boyutunda bir disk oluşturulacağını belirtir.",
      "subTopicName": "Virt İnstallıkomutu İle Vm Oluşturma",
      "normalizedSubTopicName": "virt_installikomutu_ile_vm_olusturma",
      "difficulty": "medium"
    },
    {
      "id": "q9",
      "questionText": "Çalışır durumda olan bir sanal makineyi grafiksel olarak görüntülemek için hangi komut kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "virsh list --all",
        "virt-viewer testVM",
        "virt-manager",
        "virsh start testVM"
      ],
      "correctAnswer": "virt-viewer testVM",
      "explanation": "Çalışır durumdaki bir sanal makineyi grafiksel olarak görüntülemek için 'virt-viewer sanal_makine_adı' komutu kullanılır. Örneğin, 'virt-viewer testVM'.",
      "subTopicName": "Sanal Makine Listeleme Ve Görüntüleme",
      "normalizedSubTopicName": "sanal_makine_listeleme_ve_goruntuleme",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "Tüm sanal makineleri grafik arayüzden yönetmek için hangi komut kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "virsh list --all",
        "virt-viewer testVM",
        "virt-manager",
        "virsh start testVM"
      ],
      "correctAnswer": "virt-manager",
      "explanation": "Tüm sanal makineleri grafik arayüzden yönetmek için 'virt-manager' komutu kullanılır. Bu komut, sanal makineleri başlatma, durdurma, yapılandırma gibi işlemleri kolayca yapmayı sağlar.",
      "subTopicName": "Sanal Makine Listeleme Ve Görüntüleme",
      "normalizedSubTopicName": "sanal_makine_listeleme_ve_goruntuleme",
      "difficulty": "easy"
    }
  ]
}
```
```
