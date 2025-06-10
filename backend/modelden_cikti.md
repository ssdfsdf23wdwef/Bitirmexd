# AI Model Yanıtı

Tarih: 2025-06-10T06:49:01.753Z
Trace ID: quiz-1749538127317-drhzx
Yanıt Uzunluğu: 8446 karakter

## Ham Çıktı:
```json
```json
{
  "questions": [
    {
      "id": "q1",
      "questionText": "KVM hipervizör kurulumu için gerekli paketlerden biri aşağıdakilerden hangisidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "qemu-kvm",
        "docker",
        "virtualbox",
        "vmware"
      ],
      "correctAnswer": "qemu-kvm",
      "explanation": "KVM (Kernel-based Virtual Machine) kurulumu için qemu-kvm paketi gereklidir. Diğer seçenekler farklı sanallaştırma çözümlerine aittir. Bkz: 'Kvm kurulumu' bölümü.",
      "subTopicName": "Kvm Hipervizör Kurulumu",
      "normalizedSubTopicName": "kvm_hipervizor_kurulumu",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "Aşağıdakilerden hangisi KVM kurulumu için gerekli olan komutlardan biri değildir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "sudo apt update",
        "sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils",
        "sudo systemctl enable --now libvirtd",
        "sudo docker run hello-world"
      ],
      "correctAnswer": "sudo docker run hello-world",
      "explanation": "KVM kurulumu için 'sudo apt update', 'sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils' ve 'sudo systemctl enable --now libvirtd' komutları kullanılır. 'sudo docker run hello-world' komutu Docker ile ilgili bir komuttur. Bkz: 'Kvm kurulumu' bölümü.",
      "subTopicName": "Kvm Hipervizör Kurulumu",
      "normalizedSubTopicName": "kvm_hipervizor_kurulumu",
      "difficulty": "medium"
    },
    {
      "id": "q3",
      "questionText": "KVM kurulumunda gerekli paketleri yüklemek için kullanılan komut aşağıdakilerden hangisidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo apt install kvm",
        "sudo apt install -y qemu-kvm virt-manager",
        "sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils",
        "sudo install kvm"
      ],
      "correctAnswer": "sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils",
      "explanation": "KVM kurulumunda gerekli tüm paketleri yüklemek için kullanılan doğru komut 'sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils' şeklindedir. Bu komut, KVM için gerekli olan qemu-kvm, virt-manager ve diğer bağımlılıkları yükler. Bkz: 'Kvm kurulumu' bölümü.",
      "subTopicName": "Gerekli Paketlerin Yüklenmesi",
      "normalizedSubTopicName": "gerekli_paketlerin_yuklenmesi",
      "difficulty": "easy"
    },
    {
      "id": "q4",
      "questionText": "Aşağıdakilerden hangisi KVM için gerekli paketlerden biri değildir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "qemu-kvm",
        "virt-manager",
        "libvirt-daemon-system",
        "docker"
      ],
      "correctAnswer": "docker",
      "explanation": "'qemu-kvm', 'virt-manager' ve 'libvirt-daemon-system' KVM için gerekli paketlerdir. 'docker' ise konteyner sanallaştırma için kullanılan bir araçtır ve KVM ile doğrudan ilişkili değildir. Bkz: 'Kvm kurulumu' bölümü.",
      "subTopicName": "Gerekli Paketlerin Yüklenmesi",
      "normalizedSubTopicName": "gerekli_paketlerin_yuklenmesi",
      "difficulty": "medium"
    },
    {
      "id": "q5",
      "questionText": "libvirtd servisinin otomatik olarak başlamasını sağlamak için hangi komut kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo systemctl start libvirtd",
        "sudo systemctl enable libvirtd",
        "sudo systemctl enable --now libvirtd",
        "sudo systemctl restart libvirtd"
      ],
      "correctAnswer": "sudo systemctl enable --now libvirtd",
      "explanation": "'sudo systemctl enable --now libvirtd' komutu, libvirtd servisinin hem hemen başlamasını sağlar hem de sistem yeniden başlatıldığında otomatik olarak başlamasını ayarlar. Bkz: 'Kvm kurulumu' bölümü.",
      "subTopicName": "Libvirtd Servisinin Yapılandırılması",
      "normalizedSubTopicName": "libvirtd_servisinin_yapilandirilmasi",
      "difficulty": "easy"
    },
    {
      "id": "q6",
      "questionText": "/etc/libvirt/qemu.conf dosyasında yapılması gereken değişiklikler nelerdir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Dosyayı silmek",
        "#user ve #group satırlarındaki # işaretini kaldırmak",
        "Dosyaya yeni kullanıcı eklemek",
        "Dosyayı yeniden adlandırmak"
      ],
      "correctAnswer": "#user ve #group satırlarındaki # işaretini kaldırmak",
      "explanation": "/etc/libvirt/qemu.conf dosyasında, #user ve #group satırlarındaki # işaretini kaldırmak, kullanıcı ve grup ayarlarının etkinleşmesini sağlar. Bu, sanal makinelerin doğru izinlerle çalışabilmesi için gereklidir. Bkz: 'Kvm kurulumu' bölümü.",
      "subTopicName": "Libvirtd Servisinin Yapılandırılması",
      "normalizedSubTopicName": "libvirtd_servisinin_yapilandirilmasi",
      "difficulty": "medium"
    },
    {
      "id": "q7",
      "questionText": "Virt-install komutunda, sanal makine diskinin yolunu ve boyutunu belirtmek için hangi parametre kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "--name",
        "--vcpu",
        "--disk",
        "--ram"
      ],
      "correctAnswer": "--disk",
      "explanation": "Virt-install komutunda '--disk' parametresi, sanal makine diskinin yolunu ve boyutunu belirtmek için kullanılır. Örneğin: '--disk path=/var/lib/libvirt/images/testVM.img,size=30'. Bkz: 'VM kurulumu' bölümü.",
      "subTopicName": "Virt İnstallıkomutu İle Vm Oluşturma",
      "normalizedSubTopicName": "virt_installikomutu_ile_vm_olusturma",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "Aşağıdaki virt-install komut parametrelerinden hangisi, sanal makineye atanacak RAM miktarını belirtir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "--vcpu",
        "--ram",
        "--disk",
        "--cdrom"
      ],
      "correctAnswer": "--ram",
      "explanation": "Virt-install komutunda '--ram' parametresi, sanal makineye atanacak RAM miktarını megabayt cinsinden belirtir. Örneğin: '--ram=4096' 4GB RAM atar. Bkz: 'VM kurulumu' bölümü.",
      "subTopicName": "Virt İnstallıkomutu İle Vm Oluşturma",
      "normalizedSubTopicName": "virt_installikomutu_ile_vm_olusturma",
      "difficulty": "medium"
    },
    {
      "id": "q9",
      "questionText": "Çalışan tüm sanal makineleri listelemek için kullanılan komut aşağıdakilerden hangisidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "virsh list",
        "virsh list --all",
        "virt-manager",
        "virsh status"
      ],
      "correctAnswer": "virsh list --all",
      "explanation": "'virsh list --all' komutu, çalışan ve durdurulmuş tüm sanal makineleri listeler. Sadece 'virsh list' komutu sadece çalışan sanal makineleri listeler. Bkz: 'Sanal Makinelerin Yönetilmesi' bölümü.",
      "subTopicName": "Sanal Makine Durumlarını Listeleme",
      "normalizedSubTopicName": "sanal_makine_durumlarini_listeleme",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "Aşağıdaki komutlardan hangisi tüm sanal makineleri grafik arayüzden yönetmek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "virsh list --all",
        "virt-manager",
        "virsh start testVM",
        "virsh shutdown testVM"
      ],
      "correctAnswer": "virt-manager",
      "explanation": "'virt-manager' komutu, tüm sanal makineleri grafik arayüzden yönetmek için kullanılır. Bu arayüz, sanal makineleri başlatma, durdurma, yeniden başlatma ve diğer yönetim işlemlerini kolaylaştırır. Bkz: 'Sanal Makinelerin Yönetilmesi' bölümü.",
      "subTopicName": "Sanal Makine Durumlarını Listeleme",
      "normalizedSubTopicName": "sanal_makine_durumlarini_listeleme",
      "difficulty": "easy"
    }
  ]
}
```
```
